// Server for the TapePool docs: the local preview and the Railway deployment (docs.tapepool.io).
// Serves index.html for "/" and for any extensionless path (/borrow), so a clean link opens the right page;
// serves the static files next to it (img/, fonts/, favicons) with the right type. Nothing else.
// Locally it listens on 127.0.0.1:4320. On Railway (RAILWAY_* variables set) it listens on 0.0.0.0:$PORT.
// HOST and PORT override both.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
const allowed = (rel) => /^(img|fonts)\//.test(rel) || /^(favicon\.(ico|svg)|apple-touch-icon\.png)$/.test(rel);

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed'); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end('Bad request'); return; }
  const isPage = pathname === '/' || pathname === '/index.html' || !/\.[a-z0-9]+$/i.test(pathname);
  const rel = isPage ? 'index.html' : path.posix.normalize(pathname).replace(/^\/+/, '');
  if (!isPage && (rel.startsWith('..') || rel.includes('\0') || !allowed(rel))) { res.writeHead(404).end('Not found'); return; }
  try {
    const body = await readFile(path.join(root, rel));
    res.writeHead(200, {
      'Content-Type': types[path.extname(rel).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': isPage ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'SAMEORIGIN',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(isPage ? 500 : 404).end(isPage ? 'Run `node build.mjs` first.' : 'Not found');
  }
});
const onRailway = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_ID);
const host = process.env.HOST || (onRailway ? '0.0.0.0' : '127.0.0.1');
const port = Number(process.env.PORT ?? 4320);
server.listen(port, host, () => console.log(`TapePool Docs: http://${host}:${port}`));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
