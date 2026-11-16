// Generates every app icon / splash PNG in assets/ from one vector source.
//
// Clipeo family (RV-04): same palette as Clipeo and VoleyScout (#0F1919,
// #E1E1E1, #4A9FEE) and VoleyScout's thick round-capped strokes. Rota's
// symbol ("bucle de pista"): the net on top and the rotation path through
// the six zones below (2→1→6→5→4→3), with an arrow, slightly tilted.
//
// Run inside the dev container (sharp is not a project dependency):
//   docker compose run --rm dev bash -c "npm i --no-save sharp && node scripts/render-icons.mjs"

import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const INK = '#0F1919';
const PAPER = '#E1E1E1';
const BLUE = '#4A9FEE';

const stroke = (d, color, width) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Symbol drawn in a 1000×1000 box. `net` and `path` are the two stroke colours. */
function symbol({ net, path }) {
  return `<g transform="rotate(-12 500 500)">
    ${stroke('M 110 240 L 890 240', net, 70)}
    ${stroke('M 820 370 L 820 820 L 180 820 L 180 370 L 640 370', path, 88)}
    ${stroke('M 586 276.3 L 690 370 L 586 463.7', path, 88)}
  </g>`;
}

/** `scale` = share of the canvas the 1000×1000 symbol box takes. */
function svg(size, { background, scale, net = PAPER, path = BLUE }) {
  const s = (size * scale) / 1000;
  const offset = (size - 1000 * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${background ? `<rect width="100%" height="100%" fill="${background}"/>` : ''}
    <g transform="translate(${offset} ${offset}) scale(${s})">${symbol({ net, path })}</g>
  </svg>`;
}

const outputs = [
  // iOS / store icon: opaque.
  ['assets/icon.png', svg(1024, { background: INK, scale: 0.84 }), true],
  // Android adaptive icon: only the central ~61 % is guaranteed visible.
  ['assets/android-icon-foreground.png', svg(512, { scale: 0.6 })],
  ['assets/android-icon-background.png', svg(512, { background: INK, scale: 0 })],
  ['assets/android-icon-monochrome.png', svg(432, { scale: 0.6, net: '#FFFFFF', path: '#FFFFFF' })],
  // Splash and the logo on the home screen: symbol on transparent background.
  ['assets/splash-icon.png', svg(1024, { scale: 0.9 })],
  ['assets/favicon.png', svg(48, { background: INK, scale: 0.9 }), true],
];

writeFileSync('assets/icon-source.svg', svg(1024, { background: INK, scale: 0.84 }));
for (const [file, source, opaque] of outputs) {
  let img = sharp(Buffer.from(source)).png();
  if (opaque) img = img.flatten({ background: INK });
  await img.toFile(file);
  console.log('wrote', file);
}
