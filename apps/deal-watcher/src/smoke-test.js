// apps/deal-watcher/src/smoke-test.js
// Purpose: Fast no-network smoke test for the local app classifier and scan pipeline.

import assert from 'node:assert/strict';
import { runScan } from './scan.js';

const run = await runScan({
  demoMode: true,
  noWrite: true
});

assert.equal(run.demoMode, true);
assert.ok(run.totalDeals > 0, 'expected demo scan to produce deals');
assert.ok(run.deals.some((deal) => deal.vertical === 'cruise'), 'expected cruise demo deal');
assert.ok(run.deals.some((deal) => deal.vertical === 'mistake_fare'), 'expected mistake-fare demo deal');
assert.ok(run.deals.every((deal) => Array.isArray(deal.badges)), 'expected badges array on every deal');
assert.ok(run.deals.every((deal) => Array.isArray(deal.riskFlags)), 'expected riskFlags array on every deal');

console.log(JSON.stringify({
  ok: true,
  totalDeals: run.totalDeals,
  qualifiedDeals: run.qualifiedDeals,
  topDeal: run.deals[0]?.title
}, null, 2));
