// Builds the TapePool docs into one page: index.html at the repository root, English and 中文 in one file.
// Content: src/pages.js (English) and src/pages.zh.js (Chinese, keyed by the same ids). Shell: src/template.html.
// Styles: src/styles.css. Images: img/ (served next to the page). No packages: `node build.mjs` (or `npm run build`).
//
// The build refuses to write the page when the content breaks a rule:
// - every page has id, group, title, lead and body, ids are unique, and every English page has a Chinese twin;
// - every #link names a page (and an existing section when it carries /n);
// - every <img> has alt text and points to a file that exists;
// - no stale launch number (old fees, old caps), no wording the copy rules forbid, in either language;
// - no "app coming soon" wording: the docs go public together with the app at app.tapepool.io;
// - no name from the "Never put the names" rule of the TapePool repository's CLAUDE.md;
// - every contract address appears, letter case included, in the TapePool repository (script/Addresses.sol or
//   CLAUDE.md), and the English and Chinese twins of a page list the same addresses.
// The full Chinese copy check is `npm run check:cn` (the tapepool-content-cn checker).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const load = async (p) => import(pathToFileURL(path.join(root, p)).href);
const en = await load('src/pages.js');
const zh = await load('src/pages.zh.js');
const pages = en.default;
const zhPages = zh.default;

const problems = [];
const warn = [];
const fields = ['group', 'title', 'lead', 'body'];
const ids = new Set();
for (const p of pages) {
  for (const key of ['id', ...fields]) if (typeof p[key] !== 'string' || !p[key].trim()) problems.push(`${p.id ?? '?'}: missing ${key}`);
  if (ids.has(p.id)) problems.push(`duplicate id ${p.id}`);
  if (!/^[a-z0-9-]+$/.test(p.id ?? '')) problems.push(`${p.id}: id must be lowercase letters, digits and dashes`);
  ids.add(p.id);
  const z = zhPages[p.id];
  if (!z) { problems.push(`${p.id}: no Chinese page in src/pages.zh.js`); continue; }
  for (const key of fields) if (typeof z[key] !== 'string' || !z[key].trim()) problems.push(`zh/${p.id}: missing ${key}`);
}
for (const id of Object.keys(zhPages)) if (!ids.has(id)) problems.push(`zh/${id}: no English page with this id`);

const plain = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ');
const h2count = (body) => (body.match(/<h2[\s>]/g) || []).length;

function checkPage(label, v, lang) {
  // links
  for (const [, target, section] of v.body.matchAll(/href="#([^"/]+)(?:\/(\d+))?"/g)) {
    const t = pages.find((x) => x.id === target);
    if (!t) problems.push(`${label}: link to missing page #${target}`);
    else if (section !== undefined && Number(section) >= h2count(lang === 'zh' ? zhPages[target]?.body ?? '' : t.body)) problems.push(`${label}: link to missing section #${target}/${section}`);
  }
  // images
  for (const [tag] of v.body.matchAll(/<img\b[^>]*>/g)) {
    const src = tag.match(/\ssrc="([^"]+)"/)?.[1];
    const alt = tag.match(/\salt="([^"]*)"/)?.[1];
    if (!src) { problems.push(`${label}: <img> without src`); continue; }
    if (!alt || !alt.trim()) problems.push(`${label}: ${src} has no alt text`);
    if (!/^https?:/.test(src) && !fs.existsSync(path.join(root, src))) problems.push(`${label}: image ${src} not found`);
  }
  const text = [v.title, v.nav ?? '', v.lead, plain(v.body)].join(' ');
  const rules = [
    [/\b0\.75 ?%/, 'old 7-day fee 0.75% (live: 0.25%)'],
    [/\b1\.5 ?%/, 'old 14-day fee 1.5% (live: 0.5%)'],
    [/0\.031 OKB/, 'old operating fee 0.031 OKB (live: 0)'],
    [/0\.003 BEM/, 'old minimum fee 0.003 BEM (live: 0.001 BEM)'],
    [/(min(imum)? base power|最低基础算力)[^.。]{0,60}\b20 H\b/i, 'old minimum base power 20 H (SPEC §5: 19 H)'],
    [/\b(10|20|8|4) BEM (supply|borrow|per-borrower) cap|(供应|借款)上限[^。]{0,6}\b(10|20|8|4) BEM/i, 'caps are stated as shares of the pool, not BEM amounts'],
    [/\b(audit(ed)?|third-party audit)\b|审计/i, 'audit wording (owner, 2026-11-19: do not mention audit)'],
    [/app coming soon|app (link )?is coming soon|public (app )?link[^.。]{0,30}coming soon|应用即将上线|公开(访问)?链接[^。]{0,10}即将上线/i, 'the app is live at app.tapepool.io when the docs go public: no "app coming soon"'],
  ];
  if (lang === 'en') rules.push(
    [/—/, 'em dash (use a colon, comma or parentheses)'],
    [/\bAPY\b|\bAPR\b|\byield\b|\bguaranteed\b|\brisk-free\b|\bno risk\b/i, 'return or safety promise'],
    [/\bno liquidations?\b/i, 'bare "no liquidation": say a BEM price drop never triggers liquidation, and give the seize path'],
    [/\b(the )?first (lending|lending pool|protocol) (on|in)\b/i, 'unscoped "first" claim'],
  );
  else rules.push(
    [/无清算|零清算|无风险|零风险|绝对安全|保本|年化|APY|APR|收益率|稳赚|躺赚|全网首个|唯一/, 'claim the CN copy rules forbid'],
    [/你/, '你 (docs use 您)'],
    [/！|!/, 'exclamation mark'],
    [/抵押/, '抵押 (say 把 RIG 凭证转入矿机代理)'],
  );
  for (const [re, why] of rules) if (re.test(text)) problems.push(`${label}: ${why}: "${text.match(re)[0]}"`);
}
for (const p of pages) {
  checkPage(p.id, p, 'en');
  if (zhPages[p.id]) checkPage('zh/' + p.id, zhPages[p.id], 'zh');
  if (zhPages[p.id] && h2count(zhPages[p.id].body) !== h2count(p.body)) warn.push(`zh/${p.id}: ${h2count(zhPages[p.id].body)} sections, English has ${h2count(p.body)} (section links #id/n may point elsewhere)`);
}

// forbidden names, read from the TapePool repository (never stored here)
const claudeMd = process.env.TAPEPOOL_CLAUDE_MD || path.join(root, '..', 'Tape Pool', 'CLAUDE.md');
if (fs.existsSync(claudeMd)) {
  const line = fs.readFileSync(claudeMd, 'utf8').replace(/\s+/g, ' ').match(/put the names (.+?) in code/);
  if (!line) warn.push('CLAUDE.md: the "Never put the names" rule was not found; forbidden-name check skipped');
  else {
    const names = line[1].split(/,\s*|\s+or\s+/).map((s) => s.trim()).filter(Boolean);
    const all = [...pages, ...Object.values(zhPages)].map((p) => [p.title, p.nav ?? '', p.lead, p.body].join(' ')).join(' ') + read('src/template.html');
    for (const n of names) if (new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(all)) problems.push('forbidden name found (see the TapePool CLAUDE.md rule)');
  }
} else warn.push(`forbidden-name check skipped: ${claudeMd} not found (set TAPEPOOL_CLAUDE_MD)`);

// contract addresses: each one must be recorded, letter case included, in the TapePool repository
const addressBook = path.join(path.dirname(claudeMd), 'script', 'Addresses.sol');
const addressesIn = (s) => new Set(s.match(/0x[0-9a-fA-F]{40}\b/g) ?? []);
if (fs.existsSync(claudeMd) && fs.existsSync(addressBook)) {
  const known = addressesIn(fs.readFileSync(claudeMd, 'utf8') + '\n' + fs.readFileSync(addressBook, 'utf8'));
  for (const p of pages) {
    const a = addressesIn(p.body), b = addressesIn(zhPages[p.id]?.body ?? '');
    for (const x of new Set([...a, ...b])) if (!known.has(x)) problems.push(`${p.id}: address ${x} is not recorded in the TapePool repository (script/Addresses.sol, CLAUDE.md)`);
    if ([...a].sort().join() !== [...b].sort().join()) problems.push(`${p.id}: the English and Chinese pages list different addresses`);
  }
} else warn.push(`address check skipped: ${addressBook} not found`);

if (problems.length) {
  console.error('TapePool docs: content problems, nothing written:\n- ' + [...new Set(problems)].join('\n- '));
  process.exit(1);
}
for (const w of warn) console.warn('warning: ' + w);

// JSON inside an inline <script>: escape "<" so no "</script" or "<!--" can end it early.
const pick = (v) => ({ group: v.group, title: v.title, ...(v.nav ? { nav: v.nav } : {}), lead: v.lead, body: v.body.trim() });
const json = (x) => JSON.stringify(x).replace(/</g, '\\u003c');
const data = pages.map((p) => ({ id: p.id, ...pick(p), zh: pick(zhPages[p.id]) }));
const meta = { en: { edition: en.edition, reviewed: en.reviewed }, zh: { edition: zh.edition, reviewed: zh.reviewed } };
const values = { STYLE: read('src/styles.css'), PAGES: json(data), META: json(meta) };
const html = read('src/template.html').replace(/\{\{([A-Z_]+)\}\}/g, (whole, key) => {
  if (!(key in values)) throw new Error(`template: unknown placeholder ${whole}`);
  return values[key];
});
fs.writeFileSync(path.join(root, 'index.html'), html);
const images = new Set([...pages, ...Object.values(zhPages)].flatMap((p) => [...p.body.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1])));
console.log(`Built TapePool docs: ${pages.length} pages in English and 中文, ${images.size} images, ${Buffer.byteLength(html)} bytes -> index.html`);
