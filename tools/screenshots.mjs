// Takes the app screenshots used by the docs, from the TapePool app's development fixtures.
//
//   1. Start the app's dev server on port 5180 (no wallet, no chain writes: fixtures only):
//        npm --prefix "D:/Tape Pool/app" run dev -- --port 5180 --strictPort
//      (or the "tapepool-app-fixtures" entry of .claude/launch.json)
//   2. node tools/screenshots.mjs            English, into img/app/
//      node tools/screenshots.mjs --lang zh  Chinese, into img/app/zh/
//      node tools/screenshots.mjs --only quote,repay
//
// The fixtures were written with the first MVP parameters. The script rewrites them in flight to the live launch
// values (SPEC §4.1, redeploy 4: fees 0.25% / 0.5%, minimum fee 0.001 BEM, operating fee 0 OKB, borrow cap 8 BEM), so no
// screenshot shows an old fee. It edits nothing in the app repository. Playwright and Edge come from the app's own
// install (app/node_modules, the Edge installed on the machine). Set TAPEPOOL_APP to use another app folder.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appDir = process.env.TAPEPOOL_APP || path.join(root, '..', 'Tape Pool', 'app');
const require = createRequire(path.join(appDir, 'package.json'));
const { chromium } = require('playwright-core');

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const lang = arg('--lang') ?? 'en';
const only = arg('--only')?.split(',');
const base = arg('--url') ?? 'http://localhost:5180/';
const outDir = path.join(root, 'img', 'app', lang === 'en' ? '' : lang);
const shots = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'shots.json'), 'utf8')).filter((s) => !only || only.includes(s.name));

const rewrites = [
  [/feeBps:\s*\[\s*75,\s*150\s*\]/, 'feeBps: [25, 50]'],
  [/minFee:\s*300_?000n/, 'minFee: 100000n'],
  [/borrowCapAbs:\s*1_?000_?000_?000n/, 'borrowCapAbs: 800000000n'],
  [/feePaid:\s*bem\((?:0\.009|9e-3)\)/, 'feePaid: bem(0.003)'],
  [/opsFee:\s*\[\s*31_?000_?000_?000_?000_?000n,\s*31_?000_?000_?000_?000_?000n\s*\]/, 'opsFee: [0n, 0n]'],
];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1360, height: 860 }, deviceScaleFactor: 1.5, colorScheme: 'dark', locale: lang === 'zh' ? 'zh-CN' : 'en-US' });
await ctx.route(/\/src\/fixtures\/data\.ts/, async (route) => {
  const resp = await route.fetch();
  let body = await resp.text();
  for (const [re, to] of rewrites) {
    if (!re.test(body)) throw new Error('fixture rewrite did not match (did the fixtures change?): ' + re);
    body = body.replace(re, to);
  }
  await route.fulfill({ response: resp, body });
});

fs.mkdirSync(outDir, { recursive: true });
for (const s of shots) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  // the app names Chinese 'cn' (?lang=cn, localStorage 'tp-lang')
  await page.goto(`${base}?fixture=${encodeURIComponent(s.fixture)}&lang=${lang === 'zh' ? 'cn' : lang}${s.hash ?? ''}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(s.wait ?? 1200);
  const file = path.join(outDir, s.name + '.png');
  if (s.selector) {
    const el = page.locator(s.selector).first();
    if (!(await el.count())) throw new Error(`${s.name}: selector ${s.selector} not found`);
    // hide sticky and fixed bars so they cannot cover a tall element
    await page.evaluate(() => document.querySelectorAll('body *').forEach((e) => { const p = getComputedStyle(e).position; if ((p === 'sticky' || p === 'fixed') && !e.closest('.mdl-back')) e.style.visibility = 'hidden'; }));
    await el.screenshot({ path: file });
  } else {
    await page.screenshot({ path: file, fullPage: !!s.full, ...(s.clip ? { clip: s.clip } : {}) });
  }
  console.log(`${lang}/${s.name}: ${fs.statSync(file).size} bytes${errors.length ? '  PAGE ERRORS: ' + errors.join(' | ') : ''}`);
  await page.close();
}
await browser.close();
