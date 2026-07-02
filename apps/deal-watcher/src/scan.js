// apps/deal-watcher/src/scan.js
// Purpose: Run watchlist scans, classify results, and save local deal snapshots.

import { WATCHLISTS } from './config/watchlists.js';
import { classifyResult } from './lib/classify.js';
import { DEMO_RESULTS } from './lib/demoData.js';
import { appendScanRun } from './lib/storage.js';
import { runSerpApiQuery } from './lib/serpapi.js';

export async function runScan(options = {}) {
  const startedAt = new Date().toISOString();
  const demoMode = options.demoMode ?? process.env.DEAL_WATCHER_DEMO === '1';
  const watchlistIds = options.watchlistIds?.length ? options.watchlistIds : WATCHLISTS.map((watchlist) => watchlist.id);
  const selectedWatchlists = WATCHLISTS.filter((watchlist) => watchlistIds.includes(watchlist.id));
  const deals = [];
  const errors = [];

  for (const watchlist of selectedWatchlists) {
    const queryBatch = options.maxQueriesPerWatchlist
      ? watchlist.queries.slice(0, options.maxQueriesPerWatchlist)
      : watchlist.queries;

    if (demoMode) {
      for (const result of DEMO_RESULTS[watchlist.id] || []) {
        deals.push(classifyResult(result, watchlist));
      }
      continue;
    }

    for (const query of queryBatch) {
      try {
        const response = await runSerpApiQuery(query);
        for (const result of response.organic_results || []) {
          deals.push({
            ...classifyResult(result, watchlist),
            query,
            searchedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        errors.push({
          watchlistId: watchlist.id,
          query,
          message: error.message
        });
      }
    }
  }

  const finishedAt = new Date().toISOString();
  const run = {
    id: `run_${Date.now()}`,
    startedAt,
    finishedAt,
    demoMode,
    watchlistIds,
    totalDeals: deals.length,
    qualifiedDeals: deals.filter((deal) => deal.qualifies).length,
    errors,
    deals: deals.sort((a, b) => b.score - a.score)
  };

  if (!options.noWrite) {
    await appendScanRun(run);
  }

  return run;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const demoMode = process.argv.includes('--demo') || process.env.DEAL_WATCHER_DEMO === '1';
  const noWrite = process.argv.includes('--no-write');
  const watchlistArg = process.argv.find((arg) => arg.startsWith('--watchlist='));
  const maxQueriesArg = process.argv.find((arg) => arg.startsWith('--max-queries='));
  const watchlistIds = watchlistArg ? watchlistArg.split('=')[1].split(',').map((item) => item.trim()) : undefined;
  const maxQueriesPerWatchlist = maxQueriesArg ? Number.parseInt(maxQueriesArg.split('=')[1], 10) : undefined;

  runScan({ demoMode, noWrite, watchlistIds, maxQueriesPerWatchlist })
    .then((run) => {
      console.log(JSON.stringify({
        id: run.id,
        demoMode: run.demoMode,
        totalDeals: run.totalDeals,
        qualifiedDeals: run.qualifiedDeals,
        errors: run.errors,
        topDeals: run.deals.slice(0, 10).map((deal) => ({
          title: deal.title,
          score: deal.score,
          confidence: deal.confidence,
          kind: deal.kind,
          badges: deal.badges,
          riskFlags: deal.riskFlags,
          link: deal.link
        }))
      }, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
