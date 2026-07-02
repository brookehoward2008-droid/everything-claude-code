# Travel Deal Watcher

A local SerpApi-powered dashboard for watching travel deals like a market board.

It currently tracks four deal verticals:

- Seattle cruise family deals
- all-inclusive family trip packages
- last-minute ticket deals
- mistake fares / error fares / glitch fares

## UI

The dashboard includes:

- top status bar
- scan station for demo and live scans
- top-signals ticker
- five metric cards
- watchlist agent lanes
- ranked deal board
- vertical filter
- confidence filter
- sort control
- keyword search
- score meters
- confidence pills
- badge, risk, and reject labels
- mobile-responsive layout

## Safety boundaries

The app does **not** store:

- SerpApi API keys
- SerpApi raw HTML URLs
- SerpApi JSON endpoint IDs
- search IDs
- passenger information
- booking credentials
- payment information

It stores only sanitized search results and deal classifications in `data/deals.json`.

## Run in demo mode

Demo mode needs no API key.

```bash
cd apps/deal-watcher
npm run demo
```

Open:

```txt
http://localhost:5177
```

Then click **Run demo scan**.

## Run a scan from terminal

```bash
cd apps/deal-watcher
node src/scan.js --demo
```

## Run with SerpApi

Copy the env file:

```bash
cd apps/deal-watcher
cp .env.example .env
```

Set your key locally:

```bash
export SERPAPI_KEY="your_key_here"
```

Run a live scan:

```bash
npm run scan
```

Or start the dashboard:

```bash
npm run dev
```

## Focus one watchlist

```bash
node src/scan.js --watchlist=mistake-fare-watch --max-queries=2
```

Available watchlists:

```txt
seattle-cruise-family
all-inclusive-family-trip
last-minute-ticket-deals
mistake-fare-watch
```

## How alerts are scored

Each result receives:

- `score`
- `confidence`
- `badges`
- `riskFlags`
- `rejectFlags`
- `nextAction`

A social post, review page, or historical article can become context, but it should not become a bookable alert by itself.

## Important mistake-fare warning

Mistake fares can disappear quickly and may be canceled after booking. The app labels these with risk flags and tells the user to verify the fare directly before booking hotels, excursions, or other nonrefundable connected travel.

## Current build status

This is a working local MVP. It has:

- local dashboard
- market-board UI
- safe SerpApi client
- demo scan mode
- JSON storage
- multi-watchlist query plan
- unified classifier
- risk flags
- source/review/social separation

Still needed for production:

- scheduled scans
- email/SMS alerts
- direct price verification
- login-free provider integrations where permitted
- database storage such as Supabase/Postgres
- deployment target
