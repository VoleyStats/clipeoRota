// Store graphics that don't need app screenshots:
//   store/graphics/play-icon-512.png        Google Play icon (512×512)
//   store/graphics/play-feature-1024x500.png Google Play feature graphic
//   store/graphics/review-qr-a.png / -b.png  sample QRs for App Review (referee view)
//
// Run inside the dev container (sharp and qrcode are not project dependencies;
// Space Grotesk is made visible to librsvg through ~/.fonts):
//   docker compose run --rm dev bash -c "npm i --no-save sharp qrcode && \
//     mkdir -p ~/.fonts && cp node_modules/@expo-google-fonts/space-grotesk/*/SpaceGrotesk_*.ttf ~/.fonts/ && \
//     node scripts/render-store-graphics.mjs"

import { mkdirSync, readFileSync } from 'node:fs';
import QRCode from 'qrcode';
import sharp from 'sharp';

const INK = '#0F1919';
const PAPER = '#E1E1E1';
const BLUE = '#4A9FEE';
const OUT = 'store/graphics';
mkdirSync(OUT, { recursive: true });

const stroke = (d, color, width) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

// Same symbol as scripts/render-icons.mjs (1000×1000 box).
const symbol = `<g transform="rotate(-12 500 500)">
  ${stroke('M 110 240 L 890 240', PAPER, 70)}
  ${stroke('M 820 370 L 820 820 L 180 820 L 180 370 L 640 370', BLUE, 88)}
  ${stroke('M 586 276.3 L 690 370 L 586 463.7', BLUE, 88)}
</g>`;

// 1. Play icon: the app icon at 512 px.
await sharp(readFileSync('assets/icon.png')).resize(512, 512).png().toFile(`${OUT}/play-icon-512.png`);

// 2. Feature graphic 1024×500: symbol on the left, name and claim on the right.
const feature = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <rect width="1024" height="500" fill="${INK}"/>
  <g transform="translate(70 70) scale(0.36)">${symbol}</g>
  <text x="470" y="235" font-family="Space Grotesk" font-weight="700" font-size="84" fill="#FFFFFF">Clipeo <tspan fill="${BLUE}">Rota</tspan></text>
  <text x="474" y="305" font-family="Space Grotesk" font-weight="500" font-size="34" fill="${PAPER}">La rotación de cada set,</text>
  <text x="474" y="350" font-family="Space Grotesk" font-weight="500" font-size="34" fill="${PAPER}">en un QR.</text>
</svg>`;
await sharp(Buffer.from(feature)).png().toFile(`${OUT}/play-feature-1024x500.png`);

// 3. Sample QRs (format v1, see src/core/qr.ts) so a reviewer with one device can try the referee view.
const samples = [
  ['a', { app: 'clipeo-rota', v: 1, mod: '6x6', eq: 'CLP', set: 1, zn: ['7', '12', '3', '9', '1', '15'] }],
  ['b', { app: 'clipeo-rota', v: 1, mod: '6x6', eq: 'ROT', set: 1, zn: ['4', '10', '22', '8', '5', '11'] }],
];
for (const [name, payload] of samples) {
  await QRCode.toFile(`${OUT}/review-qr-${name}.png`, JSON.stringify(payload), { width: 800, margin: 4 });
}

console.log('wrote', OUT);
