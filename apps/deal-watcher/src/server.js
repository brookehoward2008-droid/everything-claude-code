// apps/deal-watcher/src/server.js
// Purpose: Small dependency-free local dashboard and API server for the travel deal watcher.

import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WATCHLISTS } from './config/watchlists.js';
import { runScan } from './scan.js';
import { readStore } from './lib/storage.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '../public');
const PORT = Number.parseInt(process.env.DEAL_WATCHER_PORT || '5177', 10);

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

export function createDealWatcherServer() {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', `http://${request.headers.host}`);

      if (url.pathname === '/api/health') {
        return sendJson(response, {
          ok: true,
          app: 'travel-deal-watcher',
          demoMode: process.env.DEAL_WATCHER_DEMO === '1'
        });
      }

      if (url.pathname === '/api/watchlists') {
        return sendJson(response, { watchlists: WATCHLISTS });
      }

      if (url.pathname === '/api/deals') {
        const store = await readStore();
        return sendJson(response, store);
      }

      if (url.pathname === '/api/scan' && request.method === 'POST') {
        const body = await readJsonBody(request);
        const run = await runScan({
          demoMode: body.demoMode ?? process.env.DEAL_WATCHER_DEMO === '1',
          watchlistIds: body.watchlistIds,
          maxQueriesPerWatchlist: body.maxQueriesPerWatchlist
        });
        return sendJson(response, run);
      }

      return serveStatic(url.pathname, response);
    } catch (error) {
      return sendJson(response, { ok: false, error: error.message }, 500);
    }
  });
}

function serveStatic(pathname, response) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const fullPath = resolve(join(PUBLIC_DIR, safePath));

  if (!fullPath.startsWith(PUBLIC_DIR)) {
    return sendJson(response, { ok: false, error: 'Forbidden' }, 403);
  }

  const extension = extname(fullPath);
  response.writeHead(200, {
    'content-type': CONTENT_TYPES[extension] || 'application/octet-stream'
  });

  const stream = createReadStream(fullPath);
  stream.on('error', () => {
    response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ ok: false, error: 'Not found' }));
  });
  stream.pipe(response);
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (_error) {
    return {};
  }
}

function sendJson(response, payload, statusCode = 200) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createDealWatcherServer().listen(PORT, () => {
    console.log(`Travel Deal Watcher running at http://localhost:${PORT}`);
  });
}
