// App Store "Header and Search Results" assets (product page header and search
// results image, iOS 27+), one set per listing language:
//   store/graphics/appstore-header-<lang>.png   3840 × 1646 (21:9)
//   store/graphics/appstore-search-<lang>.png   3840 × 2560 (3:2)
//
// Apple's rules: no transparency; key artwork inside the safe area (the rest
// can be cropped); no prices, URLs, copyright signs or awards. Here the name
// and the claim sit in the safe area and two app screens fill the sides.
//
// Needs the raw captures (scripts/capture-screens.mjs). Run in the container:
//   docker compose run --rm dev bash -c "npm i --no-save sharp && \
//     mkdir -p ~/.fonts && cp node_modules/@expo-google-fonts/space-grotesk/*/SpaceGrotesk_*.ttf ~/.fonts/ && \
//     node scripts/render-store-header.mjs"

import sharp from 'sharp';

const BG = '#070A12';
const GLOW = '#24304F';
const BLUE = '#4A9FEE';
const PAPER = '#E1E1E1';
const BEZEL = '#1A2132';
const BEZEL_EDGE = '#3A4560';
const RAW = 'store/screenshots/raw/iphone';
const OUT = 'store/graphics';

const CLAIMS = {
  es: 'La rotación de cada set, en un QR.',
  en: 'Each set’s rotation, in a QR code.',
};

// Canvas and Apple's safe area for each placement.
const PLACEMENTS = {
  header: { width: 3840, height: 1646, safe: { x: 1097, y: 493, w: 1646, h: 661 }, phoneH: 1500, tilt: 8 },
  search: { width: 3840, height: 2560, safe: { x: 836, y: 765, w: 2168, h: 1030 }, phoneH: 2050, tilt: 8 },
};

/** A raw capture inside a phone frame, tilted, on a transparent background. */
async function phone(file, height, angle) {
  const meta = await sharp(file).metadata();
  const screenH = Math.round(height * 0.94);
  const screenW = Math.round((screenH * meta.width) / meta.height);
  const b = Math.round(screenW * 0.035);
  const w = screenW + 2 * b;
  const h = screenH + 2 * b;
  const r = Math.round(screenW * 0.13);
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${screenW}" height="${screenH}"><rect width="${screenW}" height="${screenH}" rx="${r - b}"/></svg>`;
  const screen = await sharp(file)
    .resize(screenW, screenH)
    .composite([{ input: Buffer.from(mask), blend: 'dest-in' }])
    .png()
    .toBuffer();
  const frame = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${r}" fill="${BEZEL}" stroke="${BEZEL_EDGE}" stroke-width="${Math.round(b * 0.15)}"/></svg>`;
  const framed = await sharp(Buffer.from(frame)).composite([{ input: screen, left: b, top: b }]).png().toBuffer();
  return sharp(framed)
    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer({ resolveWithObject: true });
}

for (const [name, p] of Object.entries(PLACEMENTS)) {
  const { width: W, height: H, safe } = p;
  const left = await phone(`${RAW}/01-entrenador.png`, p.phoneH, -p.tilt);
  const right = await phone(`${RAW}/02-qr.png`, p.phoneH, p.tilt);
  // Phones outside the safe area, a little off the canvas, vertically centred.
  const gap = W * 0.03;
  const lx = Math.round(safe.x - gap - left.info.width);
  const rx = Math.round(safe.x + safe.w + gap);
  const ly = Math.round((H - left.info.height) / 2 + H * 0.06);
  const ry = Math.round((H - right.info.height) / 2 + H * 0.06);

  const cx = safe.x + safe.w / 2;
  const nameSize = Math.round(safe.h * (name === 'header' ? 0.36 : 0.3));
  const claimSize = Math.round(nameSize * 0.36);

  for (const [lang, claim] of Object.entries(CLAIMS)) {
    const textTop = safe.y + (safe.h - (nameSize + claimSize * 1.9)) / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><radialGradient id="g" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="${GLOW}" stop-opacity="0.95"/><stop offset="1" stop-color="${BG}"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="${BG}"/><rect width="${W}" height="${H}" fill="url(#g)"/>
      <text x="${cx}" y="${textTop + nameSize * 0.82}" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="${nameSize}" fill="#FFFFFF">Clipeo <tspan fill="${BLUE}">Rota</tspan></text>
      <text x="${cx}" y="${textTop + nameSize + claimSize * 1.5}" text-anchor="middle" font-family="Space Grotesk" font-weight="500" font-size="${claimSize}" fill="${PAPER}">${claim}</text>
    </svg>`;
    const file = `${OUT}/appstore-${name}-${lang}.png`;
    // The phones overflow the canvas: compose on a padded canvas, then cut it back.
    const pad = 1600;
    const padded = await sharp(Buffer.from(svg))
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: BG })
      .composite([
        { input: left.data, left: lx + pad, top: ly + pad },
        { input: right.data, left: rx + pad, top: ry + pad },
      ])
      .png()
      .toBuffer();
    await sharp(padded)
      .extract({ left: pad, top: pad, width: W, height: H })
      .flatten({ background: BG })
      .removeAlpha()
      .png()
      .toFile(file);
    console.log('wrote', file);
  }
}
