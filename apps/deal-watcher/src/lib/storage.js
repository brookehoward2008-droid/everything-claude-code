// apps/deal-watcher/src/lib/storage.js
// Purpose: Tiny JSON storage for local deal snapshots. No secrets are stored.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_STORE_PATH = resolve(process.cwd(), 'data/deals.json');

export async function readStore(filePath = DEFAULT_STORE_PATH) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (_error) {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      runs: [],
      deals: []
    };
  }
}

export async function writeStore(store, filePath = DEFAULT_STORE_PATH) {
  const nextStore = {
    ...store,
    updatedAt: new Date().toISOString()
  };

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(nextStore, null, 2)}\n`, 'utf8');
  return nextStore;
}

export async function appendScanRun(run, filePath = DEFAULT_STORE_PATH) {
  const store = await readStore(filePath);
  const existingById = new Map(store.deals.map((deal) => [deal.id, deal]));

  for (const deal of run.deals) {
    const previous = existingById.get(deal.id);
    existingById.set(deal.id, {
      ...previous,
      ...deal,
      firstSeenAt: previous?.firstSeenAt || run.startedAt,
      lastSeenAt: run.finishedAt
    });
  }

  const nextStore = {
    ...store,
    runs: [run, ...store.runs].slice(0, 50),
    deals: [...existingById.values()].sort((a, b) => b.score - a.score).slice(0, 500)
  };

  return writeStore(nextStore, filePath);
}
