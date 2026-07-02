// apps/deal-watcher/src/lib/demoData.js
// Purpose: Safe demo data based on search-result shapes, without raw SerpApi IDs or private endpoints.

export const DEMO_RESULTS = {
  'seattle-cruise-family': [
    {
      position: 1,
      title: 'Balcony Cruise Deal',
      link: 'https://www.cruises.com/promotion/balcony-suite-cruises.do',
      displayed_link: 'https://www.cruises.com › promotion',
      snippet: 'Balcony and suite cruise deals. Free at Sea promotion may apply to select stateroom categories, but other promotions may not qualify when booking.',
      source: 'Cruises.com'
    },
    {
      position: 2,
      title: '3rd, 4th & 5th Guests Sail Free',
      link: 'https://www.celebritycruises.com/cruise-deals/3rd-4th-5th-guest-free',
      displayed_link: 'https://www.celebritycruises.com › cruise-deals',
      snippet: 'Additional guests sail free on select Celebrity cruises. Offer applies to select sailings and stateroom categories.',
      source: 'Celebrity Cruises'
    }
  ],
  'all-inclusive-family-trip': [
    {
      position: 1,
      title: 'Expedia Member Only Deals | Travel Discounts',
      link: 'https://www.expedia.com/deals',
      displayed_link: 'https://www.expedia.com › deals',
      snippet: 'Member-only hotel rates, discounted hotel room rates, free room upgrades, late check-out, free breakfast, and spa credits.',
      source: 'Expedia'
    },
    {
      position: 2,
      title: 'TravelPirates | Best Deals on Vacations, Flights & Hotels',
      link: 'https://www.travelpirates.com/',
      displayed_link: 'https://www.travelpirates.com',
      snippet: 'Find the best travel deals on vacation packages, flights and hotels. Stay updated on cheap vacations and save with every booking.',
      source: 'TravelPirates'
    }
  ],
  'last-minute-ticket-deals': [
    {
      position: 1,
      title: 'Gametime - Last Minute Tickets',
      link: 'https://apps.apple.com/us/app/gametime-last-minute-tickets/id630687854',
      displayed_link: 'https://apps.apple.com › app',
      snippet: 'Deals on last minute tickets to sports, concerts, and theater. Gametime is a resale market, not the main provider of tickets.',
      source: 'Apple'
    }
  ],
  'mistake-fare-watch': [
    {
      position: 1,
      title: 'Going™ | Flight Alerts, Mistake Fares & Cheap Tickets',
      link: 'https://www.going.com/',
      displayed_link: 'https://www.going.com',
      snippet: 'Get notifications on big price drops and mistake fares. We find the best deals—you just book.',
      source: 'Going'
    },
    {
      position: 2,
      title: 'Mistake Fares: Things to Know Before You Book',
      link: 'https://www.going.com/guides/mistake-fare',
      displayed_link: 'https://www.going.com › guides',
      snippet: 'Mistake fares, error fares, or glitch fares are the result of airlines or online travel agencies accidentally publishing the wrong price.',
      source: 'Going'
    }
  ]
};
