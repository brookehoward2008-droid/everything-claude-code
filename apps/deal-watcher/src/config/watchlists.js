// apps/deal-watcher/src/config/watchlists.js
// Purpose: Search verticals and focused SerpApi query batches for the travel deal watcher.

export const WATCHLISTS = [
  {
    id: 'seattle-cruise-family',
    label: 'Seattle Cruise Family Deals',
    vertical: 'cruise',
    priority: 1,
    goal: 'Roundtrip Seattle cruise deals for 2 adults and 1 child, balcony minimum, suite preferred, bundled inclusions required.',
    requiredBadges: ['SEATTLE_MATCH', 'BALCONY_OR_BETTER'],
    preferredBadges: ['SUITE_PREFERRED', 'KIDS_FREE_CLAIM', 'BUNDLED_INCLUSIONS'],
    queries: [
      '"Seattle" cruise balcony "kids sail free"',
      '"Seattle" cruise suite "kids sail free"',
      '"Seattle" cruise "Free at Sea" balcony',
      '"Seattle" cruise "Free at Sea" suite',
      '"Seattle" cruise "Princess Plus" balcony',
      '"Seattle" cruise "Princess Premier" suite',
      '"Seattle" cruise "Celebrity All Included" suite',
      '"Seattle" cruise "Have It All" suite',
      'site:vacationstogo.com Seattle cruise balcony suite',
      'site:cruises.com Seattle cruise balcony suite deal'
    ]
  },
  {
    id: 'all-inclusive-family-trip',
    label: 'All-Inclusive Family Trip Deals',
    vertical: 'all_inclusive',
    priority: 1,
    goal: 'Find bundle offers with hotel, flight, resort, family perks, upgrades, credits, or free-night/free-flight language.',
    requiredBadges: ['PACKAGE_OR_BUNDLE'],
    preferredBadges: ['FAMILY_RELEVANT', 'ALL_INCLUSIVE', 'FLIGHT_INCLUDED', 'HOTEL_INCLUDED', 'PROMO_CODE'],
    queries: [
      'all inclusive family vacation package flight hotel deal',
      'free flights hotel vacation package promotion',
      'family all inclusive resort kids free promotion',
      'Delta Vacations all inclusive family promo code',
      'Expedia package deals free breakfast room upgrade spa credit',
      'TravelPirates family vacation package deal',
      'Vacations To Go all inclusive resort family package'
    ]
  },
  {
    id: 'last-minute-ticket-deals',
    label: 'Last-Minute Ticket Deals',
    vertical: 'tickets',
    priority: 2,
    goal: 'Track resale and last-minute event ticket discount sources without treating forum chatter as verified inventory.',
    requiredBadges: ['LAST_MINUTE'],
    preferredBadges: ['VERIFIED_RESALE', 'PRICE_DETECTED', 'DISCOUNT_LANGUAGE'],
    queries: [
      'cheap last minute concert tickets verified resale',
      'last minute event tickets deals Gametime StubHub TickPick',
      'same day tickets discount theater sports concert',
      'last minute resale tickets below face value'
    ]
  },
  {
    id: 'mistake-fare-watch',
    label: 'Mistake Fare Watch',
    vertical: 'mistake_fare',
    priority: 1,
    goal: 'Find current mistake fares, error fares, glitch fares, and official/rules sources from Going.com and reputable third parties.',
    requiredBadges: ['MISTAKE_OR_ERROR_FARE'],
    preferredBadges: ['CURRENT_SIGNAL', 'OFFICIAL_SOURCE', 'PRICE_DROP'],
    queries: [
      'mistake fares today',
      'current mistake fares',
      'error fare today flight deal',
      'glitch fare today flight deal',
      'site:going.com mistake fares current',
      'site:going.com flight alerts mistake fares',
      'Going.com mistake fare ticketing error currency mismatch',
      'Forbes mistake airfares Going.com canceled percentage',
      'do airlines have to honor mistake fares'
    ]
  }
];

export function getWatchlistById(id) {
  return WATCHLISTS.find((watchlist) => watchlist.id === id);
}

export function getQueriesForWatchlist(id) {
  const watchlist = getWatchlistById(id);
  return watchlist ? watchlist.queries : [];
}
