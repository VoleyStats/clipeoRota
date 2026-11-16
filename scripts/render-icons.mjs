// Generates every app icon / splash PNG in assets/ from one vector source.
//
// Clipeo family (RV-04): same background, blue outline stroke and light-gray
// solid fill as the Clipeo icon; Rota's own symbol is a clockwise rotation
// arrow (outlined band) around a ball.
//
// Run inside the dev container (sharp is not a project dependency):
//   docker compose run --rm dev bash -c "npm i --no-save sharp && node scripts/render-icons.mjs"

import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const BG = '#0F1919';
const BLUE = '#4A9FEE';
const GRAY = '#E1E1E1';

const rad = (deg) => (deg * Math.PI) / 180;
const pt = (cx, cy, r, deg) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
const f = ([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`;

/**
 * Symbol drawn in a 1000x1000 box centred on (500, 500).
 * SVG angles grow clockwise (y points down).
 */
function symbol({ stroke, fill }) {
  const c = 500;
  const rIn = 300;
  const rOut = 400;
  const start = -35; // band start (round cap), upper right
  const end = 235; // arrowhead base, upper left: the arrow points clockwise into the gap
  const wing = 62;
  const tipAngle = end + 26;
  const rMid = (rIn + rOut) / 2;

  const d = [
    `M ${f(pt(c, c, rOut, start))}`,
    `A ${rOut} ${rOut} 0 1 1 ${f(pt(c, c, rOut, end))}`, // outer edge, clockwise
    `L ${f(pt(c, c, rOut + wing, end))}`,
    `L ${f(pt(c, c, rMid, tipAngle))}`, // arrow tip
    `L ${f(pt(c, c, rIn - wing, end))}`,
    `L ${f(pt(c, c, rIn, end))}`,
    `A ${rIn} ${rIn} 0 1 0 ${f(pt(c, c, rIn, start))}`, // inner edge, back
    `A ${(rOut - rIn) / 2} ${(rOut - rIn) / 2} 0 0 1 ${f(pt(c, c, rOut, start))}`, // round cap
    'Z',
  ].join(' ');

  return `
    <path d="${d}" fill="none" stroke="${stroke}" stroke-width="22" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${c}" cy="${c}" r="150" fill="${fill}"/>`;
}

/** `scale` = symbol size relative to the canvas. */
function svg(size, { background, scale, stroke = BLUE, fill = GRAY }) {
  const s = (size * scale) / 1000;
  const offset = (size - 1000 * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${background ? `<rect width="100%" height="100%" fill="${background}"/>` : ''}
    <g transform="translate(${offset} ${offset}) scale(${s})">${symbol({ stroke, fill })}</g>
  </svg>`;
}

const outputs = [
  // iOS / store icon: opaque, symbol ~half the canvas like Clipeo's.
  ['assets/icon.png', svg(1024, { background: BG, scale: 0.56 }), true],
  // Android adaptive icon: only the central ~61 % is guaranteed visible.
  ['assets/android-icon-foreground.png', svg(512, { scale: 0.5 })],
  ['assets/android-icon-background.png', svg(512, { background: BG, scale: 0 })],
  ['assets/android-icon-monochrome.png', svg(432, { scale: 0.5, stroke: '#FFFFFF', fill: '#FFFFFF' })],
  ['assets/splash-icon.png', svg(1024, { scale: 0.6 })],
  ['assets/favicon.png', svg(48, { background: BG, scale: 0.8 }), true],
];

writeFileSync('assets/icon-source.svg', svg(1024, { background: BG, scale: 0.56 }));
for (const [file, source, opaque] of outputs) {
  let img = sharp(Buffer.from(source)).png();
  if (opaque) img = img.flatten({ background: BG });
  await img.toFile(file);
  console.log('wrote', file);
}
