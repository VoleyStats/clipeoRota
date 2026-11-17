// Store screenshots: the raw captures (scripts/capture-screens.mjs) inside a
// device frame, with a caption on top, at the exact size each store asks for.
//
//   docker compose run --rm dev bash -c "npm i --no-save sharp && \
//     mkdir -p ~/.fonts && cp node_modules/@expo-google-fonts/space-grotesk/*/SpaceGrotesk_*.ttf ~/.fonts/ && \
//     node scripts/render-screenshots.mjs"
//
// Output: store/screenshots/<lang>/<device>/<scene>.png

import { mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const RAW = 'store/screenshots/raw';
const OUT = 'store/screenshots';

const BG = '#070A12';
const BG_GLOW = '#24304F';
const BLUE = '#4A9FEE';
const BEZEL = '#1A2132';
const BEZEL_EDGE = '#3A4560';

// Canvas in px, the status bar height in px of the raw capture, and the frame shape.
const DEVICES = {
  iphone: { width: 1320, height: 2868, statusBar: 62 * 3, scale: 3, bezel: 0.032, radius: 0.13 },
  ipad: { width: 2064, height: 2752, statusBar: 32 * 2, scale: 2, bezel: 0.025, radius: 0.045 },
  android: { width: 1080, height: 1920, statusBar: 24 * 3, scale: 3, bezel: 0.03, radius: 0.08 },
};

// *text* is drawn in the family blue.
const CAPTIONS = {
  es: {
    '01-entrenador': ['Escribe tu rotación', '*en segundos*'],
    '02-qr': ['Entrégala', '*con un QR*'],
    '03-arbitro': ['El árbitro ve', '*las dos rotaciones*'],
    '04-minivoley': ['También minivoley', '*3x3 y 4x4*'],
    '05-inicio': ['Sin cuentas', '*y sin conexión*'],
  },
  en: {
    '01-entrenador': ['Write your rotation', '*in seconds*'],
    '02-qr': ['Hand it over', '*with a QR code*'],
    '03-arbitro': ['The referee sees', '*both rotations*'],
    '04-minivoley': ['Mini volleyball', '*3v3 and 4v4 too*'],
    '05-inicio': ['No accounts,', '*no connection*'],
  },
};

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const line = (text) =>
  text.startsWith('*') ? `<tspan fill="${BLUE}">${escape(text.slice(1, -1))}</tspan>` : escape(text);

/** Status bar drawn above the capture, in the colour of the capture's first row. */
function statusBar(w, h, light, device) {
  const ink = light ? '#0F1919' : '#FFFFFF';
  const fs = h * 0.42;
  const y = device === 'iphone' ? h * 0.62 : h * 0.68;
  const x = device === 'iphone' ? w * 0.12 : w * 0.04;
  const right = w - x;
  const u = fs / 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="${light ? '#FFFFFF' : BG}"/>
    <text x="${x}" y="${y}" font-family="Space Grotesk" font-weight="700" font-size="${fs}" fill="${ink}">9:41</text>
    <g fill="${ink}" transform="translate(${right - 70 * u} ${y - 12 * u})">
      <rect x="0" y="8" width="3.5" height="4" rx="1" transform="scale(${u})"/>
      <rect x="5" y="5.5" width="3.5" height="6.5" rx="1" transform="scale(${u})"/>
      <rect x="10" y="3" width="3.5" height="9" rx="1" transform="scale(${u})"/>
      <rect x="15" y="0.5" width="3.5" height="11.5" rx="1" transform="scale(${u})"/>
      <path transform="translate(${26 * u} 0) scale(${u})" d="M8 12 L4.5 8.3 A5 5 0 0 1 11.5 8.3 Z M1.6 5.3 A9.2 9.2 0 0 1 14.4 5.3 L13 6.8 A7.2 7.2 0 0 0 3 6.8 Z"/>
      <rect transform="translate(${46 * u} 0) scale(${u})" x="0" y="0.5" width="22" height="11.5" rx="3.2" fill="none" stroke="${ink}" stroke-width="1.2" opacity="0.5"/>
      <rect transform="translate(${46 * u} 0) scale(${u})" x="2" y="2.5" width="16" height="7.5" rx="1.8"/>
    </g>
  </svg>`;
}

for (const [device, d] of Object.entries(DEVICES)) {
  const { width: W, height: H } = d;
  const k = Math.min(W / 1320, H / 2868);
  const captionH = H * (device === 'ipad' ? 0.17 : 0.2);

  for (const file of readdirSync(join(RAW, device)).filter((f) => f.endsWith('.png'))) {
    const scene = file.replace('.png', '');
    const raw = sharp(join(RAW, device, file));
    const { width: rw, height: rh } = await raw.metadata();
    const { data: px } = await raw.clone().extract({ left: 2, top: 2, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
    const light = px[0] > 200 && px[1] > 200 && px[2] > 200;

    // Screen = status bar + capture, scaled so the framed device fits under the caption.
    const screenW0 = rw;
    const screenH0 = rh + d.statusBar;
    const maxW = W * 0.86;
    const maxH = H - captionH - H * 0.045;
    const bezelPx = (s) => s * d.bezel;
    let screenW = Math.min(maxW / (1 + 2 * d.bezel), (maxH / (screenH0 / screenW0 + 2 * d.bezel)));
    screenW = Math.round(screenW);
    const screenH = Math.round((screenW * screenH0) / screenW0);
    const b = Math.round(bezelPx(screenW));
    const frameW = screenW + 2 * b;
    const frameH = screenH + 2 * b;
    const frameX = Math.round((W - frameW) / 2);
    const frameY = Math.round(captionH + (H - captionH - frameH) * 0.35);
    const outerR = Math.round(screenW * d.radius);
    const innerR = Math.max(outerR - b, 4);

    const screen = await sharp({ create: { width: screenW0, height: screenH0, channels: 4, background: BG } })
      .composite([
        { input: Buffer.from(statusBar(screenW0, d.statusBar, light, device)), left: 0, top: 0 },
        { input: await raw.toBuffer(), left: 0, top: d.statusBar },
      ])
      .png()
      .toBuffer();
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${screenW}" height="${screenH}"><rect width="${screenW}" height="${screenH}" rx="${innerR}"/></svg>`);
    const screenFit = await sharp(screen).resize(screenW, screenH).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();

    for (const [lang, captions] of Object.entries(CAPTIONS)) {
      const [l1, l2] = captions[scene];
      const fs = Math.round(112 * k * (device === 'android' ? 1.25 : 1));
      const background = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs><radialGradient id="g" cx="50%" cy="62%" r="60%"><stop offset="0" stop-color="${BG_GLOW}" stop-opacity="0.9"/><stop offset="1" stop-color="${BG}"/></radialGradient></defs>
        <rect width="${W}" height="${H}" fill="${BG}"/><rect width="${W}" height="${H}" fill="url(#g)"/>
        <text x="${W / 2}" y="${captionH * 0.48}" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="${fs}" fill="#FFFFFF">${line(l1)}</text>
        <text x="${W / 2}" y="${captionH * 0.48 + fs * 1.12}" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="${fs}" fill="#FFFFFF">${line(l2)}</text>
        <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="${outerR}" fill="${BEZEL}" stroke="${BEZEL_EDGE}" stroke-width="${Math.max(2, b * 0.12)}"/>
      </svg>`;
      const dir = join(OUT, lang, device);
      mkdirSync(dir, { recursive: true });
      await sharp(Buffer.from(background))
        .composite([{ input: screenFit, left: frameX + b, top: frameY + b }])
        .flatten({ background: BG })
        .png()
        .toFile(join(dir, file));
    }
    console.log(device, scene);
  }
}
