// Markup helpers shared by the English and Chinese pages. They run at build time (Node), so they may check files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function helpers(lang) {
  const zh = lang === 'zh';
  const sample = zh ? '示例数据' : 'Sample data';
  /** An app screenshot from the app's development fixtures (sample data at launch values), in the page's language. */
  const shot = (file, alt, caption, size = '') =>
    `<figure class="${size}"><img src="img/app/${zh ? 'zh/' : ''}${file}.png" alt="${alt}"><figcaption><span class="sample">${sample}</span>${caption}</figcaption></figure>`;
  /** An illustration from the TapePool content kit; the Chinese edition uses img/diagrams/zh/ when a version exists. */
  const art = (file, alt, caption, size = '') => {
    const local = zh && fs.existsSync(path.join(root, 'img', 'diagrams', 'zh', file + '.png'));
    return `<figure class="${size}"><img src="img/diagrams/${local ? 'zh/' : ''}${file}.png" alt="${alt}"><figcaption>${caption}</figcaption></figure>`;
  };
  const table = (head, rows, cls = []) =>
    `<div class="table-wrap"><table><thead><tr>${head.map((h, i) => `<th class="${cls[i] ?? ''}">${h}</th>`).join('')}</tr></thead><tbody>${rows
      .map((r) => `<tr>${r.map((c, i) => `<td class="${cls[i] ?? ''}">${c}</td>`).join('')}</tr>`)
      .join('')}</tbody></table></div>`;
  /** A full contract address linked to the explorer of its chain (the explorers the app itself links to). */
  const addr = (a, chain = 'xlayer') =>
    `<a class="addr" href="${EXPLORER[chain]}${a}" target="_blank" rel="noreferrer"><code>${a}</code></a>`;
  return { shot, art, table, addr };
}

export const X = 'https://x.com/Tape_Pool';
export const TAPEOUT = 'https://tapeout.net';
export const APP = 'https://app.tapepool.io';
// The tutorial video (TapePool channel). The embed uses the no-cookie domain.
export const YOUTUBE = 'https://youtu.be/s8IG_HjWv8Q';
export const YOUTUBE_EMBED = 'https://www.youtube-nocookie.com/embed/s8IG_HjWv8Q';
const EXPLORER = { xlayer: 'https://www.oklink.com/xlayer/address/', bsc: 'https://bscscan.com/address/' };

/**
 * TapePool's own contracts. Every address here must appear, letter case included, in the TapePool repository
 * (script/Addresses.sol or CLAUDE.md); build.mjs checks it. Redeploy 4 is the current stack (deployed 2026-11-16).
 */
export const C = {
  pool: '0x1a9A9850D597D8e3a03AFae48E3ac8E2D4aeC9d7',
  factory: '0xA9014E27dD17ea30E4Fa4f71934645b9DCEF8ac8',
  agentImpl: '0x0D4BA9992B2b887ea1f55E59925339547C772259',
  policy: '0xBBFe498158b6A234f4f63B17673f6e8226656D34',
  screen: '0xc2bBc2f2EC90e16f8a9619D26A51144Eb0AC1744',
  lens: '0xFcc669BC9cCa397CB01804035D5Be981d7389ef2',
  receiver: '0xc94C9Cc912203c29C2c1b3534e0852BF4aFAeA10',
  reporter: '0xD54673E73448584E86C61f45203ab507F3F2c3eC', // BSC
  circuits: '0xdc76f123838b5398A173D215a2c8338Ad189C9a8',
  transistors: '0x05264cF3862266165401d3961935D0D230bC8fd6',
  // Only the contracts in use are listed (owner, 2026-11-19); retired pools and feeds are left out.
};
