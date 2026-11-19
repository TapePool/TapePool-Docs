// Runs the tapepool-content-cn checker on the Chinese docs.
// Writes the Chinese pages as one markdown file (.cache/cn-docs.md: headings, paragraphs, list items and table cells
// as plain text), then runs the checker in docs mode against it. Exit code: the checker's (1 when it finds an ERROR).
//
//   node tools/check-cn.mjs        (npm run check:cn)
//
// TAPEPOOL_CN_CHECKER overrides the checker path; TAPEPOOL_CLAUDE_MD the CLAUDE.md that holds the forbidden-name rule.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checker = process.env.TAPEPOOL_CN_CHECKER || path.join(os.homedir(), '.claude', 'skills', 'tapepool-content-cn', 'scripts', 'check-cn.js');
const claudeMd = process.env.TAPEPOOL_CLAUDE_MD || path.join(root, '..', 'Tape Pool', 'CLAUDE.md');
if (!fs.existsSync(checker)) { console.error(`checker not found: ${checker} (set TAPEPOOL_CN_CHECKER)`); process.exit(2); }

const { default: zh } = await import(pathToFileURL(path.join(root, 'src', 'pages.zh.js')).href);
const { default: en } = await import(pathToFileURL(path.join(root, 'src', 'pages.js')).href);
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const toText = (html) => decode(html
  .replace(/<pre>[\s\S]*?<\/pre>/g, '\n') // formulas: code, not prose
  .replace(/<figure[\s\S]*?<figcaption>/g, '\n').replace(/<\/figcaption><\/figure>/g, '\n')
  .replace(/<span class="sample">[^<]*<\/span>/g, '')
  .replace(/<\/span>/g, '\n') // badges and tags are separate labels
  .replace(/(<li><strong>[^<]*)<\/strong>/g, '$1\n') // a step title is its own line
  .replace(/<\/strong><p>/g, '\n') // a card title is its own line
  .replace(/<h2[^>]*>/g, '\n## ').replace(/<h3[^>]*>/g, '\n### ')
  .replace(/<\/(p|li|h2|h3|dt|dd|summary|td|th|div|tr)>/g, '\n')
  .replace(/<br\s*\/?>/g, '\n')
  .replace(/<[^>]+>/g, ''))
  .split('\n').map((l) => l.trim()).filter(Boolean).join('\n\n');

const md = en.map((p) => { const z = zh[p.id]; return `# ${z.title}\n\n${z.lead}\n\n${toText(z.body)}`; }).join('\n\n');
fs.mkdirSync(path.join(root, '.cache'), { recursive: true });
const file = path.join(root, '.cache', 'cn-docs.md');
fs.writeFileSync(file, md);
console.log(`Chinese docs text: ${file} (${md.length} characters)`);
const run = spawnSync(process.execPath, [checker, file, '--mode', 'docs', '--claude-md', claudeMd], { stdio: 'inherit' });
process.exit(run.status ?? 1);
