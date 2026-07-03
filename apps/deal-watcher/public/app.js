const state = {
  store: null,
  watchlists: [],
  verticalFilter: 'all',
  confidenceFilter: 'all',
  sortBy: 'score',
  searchQuery: ''
};

const elements = {
  demoScanButton: document.querySelector('#demoScanButton'),
  liveScanButton: document.querySelector('#liveScanButton'),
  scanStatus: document.querySelector('#scanStatus'),
  latestMode: document.querySelector('#latestMode'),
  latestRun: document.querySelector('#latestRun'),
  totalDeals: document.querySelector('#totalDeals'),
  qualifiedDeals: document.querySelector('#qualifiedDeals'),
  highConfidenceDeals: document.querySelector('#highConfidenceDeals'),
  riskCount: document.querySelector('#riskCount'),
  averageScore: document.querySelector('#averageScore'),
  agentLanes: document.querySelector('#agentLanes'),
  deals: document.querySelector('#deals'),
  marketTicker: document.querySelector('#marketTicker'),
  verticalFilter: document.querySelector('#verticalFilter'),
  confidenceFilter: document.querySelector('#confidenceFilter'),
  sortSelect: document.querySelector('#sortSelect'),
  searchInput: document.querySelector('#searchInput')
};

async function init() {
  elements.demoScanButton.addEventListener('click', () => runScan({ demoMode: true }));
  elements.liveScanButton.addEventListener('click', () => runScan({ demoMode: false, maxQueriesPerWatchlist: 2 }));
  elements.verticalFilter.addEventListener('change', (event) => {
    state.verticalFilter = event.target.value;
    renderDeals();
  });
  elements.confidenceFilter.addEventListener('change', (event) => {
    state.confidenceFilter = event.target.value;
    renderDeals();
  });
  elements.sortSelect.addEventListener('change', (event) => {
    state.sortBy = event.target.value;
    renderDeals();
  });
  elements.searchInput.addEventListener('input', (event) => {
    state.searchQuery = event.target.value.trim().toLowerCase();
    renderDeals();
  });

  await loadWatchlists();
  await loadDeals();
}

async function loadWatchlists() {
  const response = await fetch('/api/watchlists');
  const data = await response.json();
  state.watchlists = data.watchlists || [];
  renderAgentLanes();
}

async function loadDeals() {
  const response = await fetch('/api/deals');
  state.store = await response.json();
  renderAll();
}

async function runScan(options) {
  setButtonsDisabled(true);
  setScanStatus('Scanning agents...', 'scanning');

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

    setScanStatus(`Scan complete: ${run.qualifiedDeals} qualified`, 'success');
    await loadDeals();
  } catch (error) {
    setScanStatus('Scan failed', 'error');
    elements.deals.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
  } finally {
    setButtonsDisabled(false);
  }
}

function renderAll() {
  renderStats();
  renderLatestRun();
  renderTicker();
  renderAgentLanes();
  renderDeals();
}

function setButtonsDisabled(disabled) {
  elements.demoScanButton.disabled = disabled;
  elements.liveScanButton.disabled = disabled;
}

function setScanStatus(message, status) {
  elements.scanStatus.textContent = message;
  elements.scanStatus.className = `status-pill ${status || ''}`.trim();
}

function renderLatestRun() {
  const latestRun = state.store?.runs?.[0];
  elements.latestMode.textContent = latestRun ? (latestRun.demoMode ? 'Demo' : 'Live') : 'None';
  elements.latestRun.textContent = latestRun ? formatDate(latestRun.finishedAt) : 'Not scanned';
}

function renderStats() {
  const deals = getDeals();
  const totalScore = deals.reduce((total, deal) => total + Number(deal.score || 0), 0);
  const averageScore = deals.length ? Math.round(totalScore / deals.length) : 0;

  elements.totalDeals.textContent = String(deals.length);
  elements.qualifiedDeals.textContent = String(deals.filter((deal) => deal.qualifies).length);
  elements.highConfidenceDeals.textContent = String(deals.filter((deal) => deal.confidence === 'high').length);
  elements.riskCount.textContent = String(deals.reduce((total, deal) => total + (deal.riskFlags?.length || 0), 0));
  elements.averageScore.textContent = String(averageScore);
}

function renderTicker() {
  const deals = getDeals().slice(0, 8);

  if (deals.length === 0) {
    elements.marketTicker.textContent = 'Run a scan to populate the board.';
    return;
  }

  elements.marketTicker.innerHTML = deals
    .map((deal) => `
      <span class="ticker-item">
        ${escapeHtml(deal.title)} | ${deal.score} | ${escapeHtml(deal.confidence)}
      </span>
    `)
    .join('');
}

function renderAgentLanes() {
  const deals = getDeals();

  elements.agentLanes.innerHTML = state.watchlists
    .map((watchlist) => {
      const laneDeals = deals.filter((deal) => deal.watchlistId === watchlist.id);
      const qualified = laneDeals.filter((deal) => deal.qualifies).length;
      const high = laneDeals.filter((deal) => deal.confidence === 'high').length;

      return `
        <article class="agent-card">
          <header>
            <div>
              <p class="eyebrow">${escapeHtml(watchlist.vertical)}</p>
              <h3>${escapeHtml(watchlist.label)}</h3>
            </div>
            <div class="agent-count">${laneDeals.length}</div>
          </header>
          <p class="watchlist-goal">${escapeHtml(watchlist.goal)}</p>
          <div class="agent-meta">
            <span>${watchlist.queries.length} queries</span>
            <span>${qualified} qualified</span>
            <span>${high} high</span>
            <span>Priority ${watchlist.priority}</span>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderDeals() {
  const filteredDeals = applyDealFilters(getDeals());

  if (filteredDeals.length === 0) {
    elements.deals.innerHTML = '<div class="empty">No matching deals. Run a demo scan, clear filters, or add your SerpApi key for live scans.</div>';
    return;
  }

  elements.deals.innerHTML = filteredDeals
    .slice(0, 80)
    .map((deal, index) => renderDealCard(deal, index))
    .join('');
}

function renderDealCard(deal, index) {
  const score = Number(deal.score || 0);
  const scoreWidth = Math.max(4, Math.min(100, score));
  const featuredClass = index === 0 ? ' featured' : '';
  const rejectFlags = deal.rejectFlags || [];

  return `
    <article class="deal-card${featuredClass}">
      <header>
        <div>
          <p class="eyebrow">${escapeHtml(deal.vertical)} / ${escapeHtml(deal.kind)}</p>
          <h3>${escapeHtml(deal.title)}</h3>
        </div>
        <div class="score-box">
          <span class="confidence-pill ${escapeHtml(deal.confidence)}">${escapeHtml(deal.confidence)}</span>
          <span class="score-number">${score}</span>
          <div class="score-meter" aria-hidden="true"><span style="width:${scoreWidth}%"></span></div>
        </div>
      </header>

      <p>${escapeHtml(deal.snippet || 'No snippet available.')}</p>

      <div class="meta">
        <span>${escapeHtml(deal.source || 'Unknown source')}</span>
        <span>${deal.qualifies ? 'Qualified candidate' : 'Context only'}</span>
        ${deal.price ? `<span>$${deal.price}</span>` : ''}
        ${deal.date ? `<span>${escapeHtml(deal.date)}</span>` : ''}
      </div>

      ${renderPills(deal.badges, 'badge')}
      ${renderPills(deal.riskFlags, 'risk')}
      ${renderPills(rejectFlags, 'reject')}

      <div class="deal-card-footer">
        <p class="next-action"><strong>Next:</strong> ${escapeHtml(deal.nextAction || 'Review source before acting.')}</p>
        ${deal.link ? `<a class="source-link" href="${escapeAttribute(deal.link)}" target="_blank" rel="noreferrer">Open source</a>` : ''}
      </div>
    </article>
  `;
}

function renderPills(values = [], className) {
  if (!values.length) return '';
  return `
    <div class="${className === 'badge' ? 'badges' : 'risks'}">
      ${values.map((value) => `<span class="${className}">${escapeHtml(value)}</span>`).join('')}
    </div>
  `;
}

function getDeals() {
  return state.store?.deals || [];
}

function applyDealFilters(deals) {
  const filtered = deals.filter((deal) => {
    const matchesVertical = state.verticalFilter === 'all' || deal.vertical === state.verticalFilter;
    const matchesConfidence = state.confidenceFilter === 'all' || deal.confidence === state.confidenceFilter;
    const haystack = [deal.title, deal.snippet, deal.source, deal.kind, ...(deal.badges || []), ...(deal.riskFlags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesSearch = !state.searchQuery || haystack.includes(state.searchQuery);

    return matchesVertical && matchesConfidence && matchesSearch;
  });

  return filtered.sort((a, b) => {
    if (state.sortBy === 'risk') {
      return (b.riskFlags?.length || 0) - (a.riskFlags?.length || 0) || b.score - a.score;
    }

    if (state.sortBy === 'newest') {
      return getDealTimestamp(b) - getDealTimestamp(a);
    }

    return b.score - a.score;
  });
}

function getDealTimestamp(deal) {
  const parsed = Date.parse(deal.lastSeenAt || deal.searchedAt || '');
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value) {
  if (!value) return 'Not scanned';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scanned';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
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
  setScanStatus('UI failed', 'error');
  elements.deals.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
});
