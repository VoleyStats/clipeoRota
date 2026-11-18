// Raw app screenshots for the store listings, taken from the web build.
//
//   1. docker compose run --rm dev npx expo export --platform web      (→ dist/)
//   2. docker run --rm -v "$PWD":/app -w /app mcr.microsoft.com/playwright:v1.49.1-noble \
//        bash -c "npm i --no-save --prefix /tmp/pw playwright@1.49.1 && NODE_PATH=/tmp/pw/node_modules node scripts/capture-screens.mjs"
//   3. scripts/render-screenshots.mjs adds the device frame and the caption.
//
// Output: store/screenshots/raw/<device>/<scene>.png. The app's state is seeded
// through localStorage (AsyncStorage on web), so every capture is reproducible.

import { createRequire } from 'node:module';
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const DIST = 'dist';
const OUT = 'store/screenshots/raw';
const PORT = 4173;

// Viewport in points (device height minus the status bar, which the frame draws) and pixel ratio.
export const DEVICES = {
  iphone: { width: 440, height: 956 - 62, scale: 3 },
  ipad: { width: 1032, height: 1376 - 32, scale: 2 },
  android: { width: 360, height: 640 - 24, scale: 3 },
};

const coach6 = {
  team: 'CLP',
  // Set 2 means set 1's QR was already shown, so the code is fixed.
  teamLocked: true,
  current: 2,
  viewing: 2,
  sets: {
    1: ['7', '12', '3', '9', '1', '15'],
    2: ['12', '3', '9', '1', '15', '7'],
  },
};
const coach4 = { team: 'MIN', teamLocked: false, current: 1, viewing: 1, sets: { 1: ['4', '8', '11', '2'] } };
const referee6 = {
  A: { mode: '6x6', team: 'CLP', set: 2, dorsales: ['12', '3', '9', '1', '15', '7'] },
  B: { mode: '6x6', team: 'ROT', set: 2, dorsales: ['4', '10', '22', '8', '5', '11'] },
};

const SCENES = [
  { name: '01-entrenador', path: '/entrenador/6x6', storage: { 'coach:6x6': coach6 } },
  { name: '02-qr', path: '/entrenador/6x6', storage: { 'coach:6x6': coach6 }, click: 'Mostrar QR' },
  { name: '03-arbitro', path: '/arbitro/6x6', storage: { 'referee:6x6': referee6 } },
  { name: '04-minivoley', path: '/entrenador/4x4', storage: { 'coach:4x4': coach4 } },
  { name: '05-inicio', path: '/', storage: { prefs: { mode: '6x6', profile: null } } },
];

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf', '.json': 'application/json', '.ico': 'image/x-icon' };

// Static server with SPA fallback, so deep links like /entrenador/6x6 load index.html.
const server = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(DIST, url);
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html');
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(PORT);

const browser = await chromium.launch();
for (const [device, { width, height, scale }] of Object.entries(DEVICES)) {
  mkdirSync(join(OUT, device), { recursive: true });
  for (const scene of SCENES) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, hasTouch: true, isMobile: device !== 'ipad' });
    const storage = { prefs: { mode: '6x6', profile: null }, ...scene.storage };
    // Match data is stored with the time of its last change (src/core/expiry.ts); prefs aren't.
    await context.addInitScript((entries) => {
      for (const [key, value] of Object.entries(entries)) {
        const stored = key === 'prefs' ? value : { savedAt: Date.now(), data: value };
        localStorage.setItem(key, JSON.stringify(stored));
      }
    }, storage);
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}${scene.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (scene.click) await page.getByText(scene.click, { exact: true }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(OUT, device, `${scene.name}.png`) });
    await context.close();
    console.log(device, scene.name);
  }
}
await browser.close();
server.close();
