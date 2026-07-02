const state = {
  store: null,
  watchlists: [],
  verticalFilter: 'all'
};

const elements = {
  demoScanButton: document.querySelector('#demoScanButton'),
  liveScanButton: document.querySelector('#liveScanButton'),
  totalDeals: document.querySelector('#totalDeals'),
  qualifiedDeals: document.querySelector('#qualifiedDeals'),
  highConfidenceDeals: document.querySelector('#highConfidenceDeals'),
  riskCount: document.querySelector('#riskCount'),
  watchlists: document.querySelector('#watchlists'),
  deals: document.querySelector('#deals'),
  verticalFilter: document.querySelector('#verticalFilter')
};

async function init() {
  elements.demoScanButton.addEventListener('click', () => runScan({ demoMode: true }));
  elements.liveScanButton.addEventListener('click', () => runScan({ demoMode: false, maxQueriesPerWatchlist: 2 }));
  elements.verticalFilter.addEventListener('change', (event) => {
    state.verticalFilter = event.target.value;
    renderDeals();
  });

  await loadWatchlists();
  await loadDeals();
}

async function loadWatchlists() {
  const response = await fetch('/api/watchlists');
  const data = await response.json();
  state.watchlists = data.watchlists || [];
  renderWatchlists();
}

async function loadDeals() {
  const response = await fetch('/api/deals');
  state.store = await response.json();
  renderStats();
  renderDeals();
}

async function runScan(options) {
  setButtonsDisabled(true);
  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(options)
    });

    const run = await response.json();
    if (run.error) {
      throw new Error(run.error);
    }

    await loadDeals();
  } catch (error) {
    elements.deals.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
  } finally {
    setButtonsDisabled(false);
  }
}

function setButtonsDisabled(disabled) {
  elements.demoScanButton.disabled = disabled;
  elements.liveScanButton.disabled = disabled;
}

function renderWatchlists() {
  elements.watchlists.innerHTML = state.watchlists
    .map((watchlist) => `
      <article class="watchlist-card">
        <p class="eyebrow">${escapeHtml(watchlist.vertical)}</p>
        <h3>${escapeHtml(watchlist.label)}</h3>
        <p>${escapeHtml(watchlist.goal)}</p>
        <div class="meta">
          <span>${watchlist.queries.length} queries</span>
          <span>Priority ${watchlist.priority}</span>
        </div>
      </article>
    `)
    .join('');
}

function renderStats() {
  const deals = state.store?.deals || [];
  elements.totalDeals.textContent = String(deals.length);
  elements.qualifiedDeals.textContent = String(deals.filter((deal) => deal.qualifies).length);
  elements.highConfidenceDeals.textContent = String(deals.filter((deal) => deal.confidence === 'high').length);
  elements.riskCount.textContent = String(deals.reduce((total, deal) => total + (deal.riskFlags?.length || 0), 0));
}

function renderDeals() {
  const deals = state.store?.deals || [];
  const filteredDeals = state.verticalFilter === 'all'
    ? deals
    : deals.filter((deal) => deal.vertical === state.verticalFilter);

  if (filteredDeals.length === 0) {
    elements.deals.innerHTML = '<div class="empty">No deals yet. Run a demo scan first, then add your SerpApi key for live scans.</div>';
    return;
  }

  elements.deals.innerHTML = filteredDeals
    .slice(0, 60)
    .map((deal) => `
      <article class="deal-card">
        <header>
          <div>
            <p class="eyebrow">${escapeHtml(deal.vertical)} · ${escapeHtml(deal.kind)}</p>
            <h3>${escapeHtml(deal.title)}</h3>
          </div>
          <div class="score">
            <strong>${deal.score}</strong>
            <span>${escapeHtml(deal.confidence)}</span>
          </div>
        </header>
        <p>${escapeHtml(deal.snippet || 'No snippet available.')}</p>
        <div class="meta">
          <span>${escapeHtml(deal.source || 'Unknown source')}</span>
          <span>${deal.qualifies ? 'Qualified candidate' : 'Context only'}</span>
          ${deal.price ? `<span>$${deal.price}</span>` : ''}
        </div>
        <div class="badges">${(deal.badges || []).map((badge) => `<span class="badge">${escapeHtml(badge)}</span>`).join('')}</div>
        <div class="risks">${(deal.riskFlags || []).map((risk) => `<span class="risk">${escapeHtml(risk)}</span>`).join('')}</div>
        <p><strong>Next:</strong> ${escapeHtml(deal.nextAction || '')}</p>
        ${deal.link ? `<a href="${escapeAttribute(deal.link)}" target="_blank" rel="noreferrer">Open source</a>` : ''}
      </article>
    `)
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

init().catch((error) => {
  elements.deals.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
});
