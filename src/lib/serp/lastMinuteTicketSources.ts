// src/lib/serp/lastMinuteTicketSources.ts
// Purpose: Known source domains for last-minute event-ticket and resale-market monitoring.

export type LastMinuteTicketSourceTier =
  | "verified_ticket_marketplace"
  | "primary_ticket_platform"
  | "editorial_research"
  | "social_signal"
  | "flight_deal_source"
  | "low_trust_source";

export type LastMinuteTicketSourceDefinition = {
  domain: string;
  displayName: string;
  tier: LastMinuteTicketSourceTier;
  notes: string;
};

export const LAST_MINUTE_TICKET_SOURCES: LastMinuteTicketSourceDefinition[] = [
  {
    domain: "gametime.co",
    displayName: "Gametime",
    tier: "verified_ticket_marketplace",
    notes: "Strong source for last-minute sports, concert, and theater ticket resale.",
  },
  {
    domain: "apps.apple.com",
    displayName: "Apple App Store",
    tier: "editorial_research",
    notes: "Useful for app discovery and app-store metadata, but not direct live ticket pricing.",
  },
  {
    domain: "ticketmaster.com",
    displayName: "Ticketmaster",
    tier: "primary_ticket_platform",
    notes: "Primary ticketing and verified resale source. Important for face-value versus resale comparison.",
  },
  {
    domain: "stubhub.com",
    displayName: "StubHub",
    tier: "verified_ticket_marketplace",
    notes: "Major resale marketplace. Useful for last-minute price-drop monitoring.",
  },
  {
    domain: "tickpick.com",
    displayName: "TickPick",
    tier: "verified_ticket_marketplace",
    notes: "Resale marketplace commonly mentioned for fee-aware ticket shopping.",
  },
  {
    domain: "seatgeek.com",
    displayName: "SeatGeek",
    tier: "verified_ticket_marketplace",
    notes: "Major resale marketplace with event, section, row, and price signals.",
  },
  {
    domain: "vividseats.com",
    displayName: "Vivid Seats",
    tier: "verified_ticket_marketplace",
    notes: "Major resale marketplace. Useful for price comparison and marketplace spread tracking.",
  },
  {
    domain: "billboard.com",
    displayName: "Billboard",
    tier: "editorial_research",
    notes: "Useful for source discovery and current ticket-site roundups, not verified live pricing.",
  },
  {
    domain: "purplepass.com",
    displayName: "PurplePass",
    tier: "editorial_research",
    notes: "Event-ticketing research source. Watch for stale publication dates.",
  },
  {
    domain: "reddit.com",
    displayName: "Reddit",
    tier: "social_signal",
    notes: "Useful for user behavior and warnings. Never treat as verified ticket inventory.",
  },
  {
    domain: "facebook.com",
    displayName: "Facebook",
    tier: "social_signal",
    notes: "Useful for source discovery only. Private-seller posts require high scam-risk labels.",
  },
  {
    domain: "quora.com",
    displayName: "Quora",
    tier: "low_trust_source",
    notes: "Anecdotal advice source. Low scoring for purchase decisions.",
  },
  {
    domain: "skyscanner.com",
    displayName: "Skyscanner",
    tier: "flight_deal_source",
    notes: "Flight deal source. Keep separate from event-ticket resale logic.",
  },
  {
    domain: "kayak.com",
    displayName: "KAYAK",
    tier: "flight_deal_source",
    notes: "Flight research and deal source. Keep in travel/flight watcher module.",
  },
  {
    domain: "golastminute.com",
    displayName: "GoLastMinute",
    tier: "flight_deal_source",
    notes: "Flight deal source. Not an event-ticket source.",
  },
];

export function findLastMinuteTicketSource(urlOrText: string): LastMinuteTicketSourceDefinition | undefined {
  const normalized = urlOrText.toLowerCase();
  return LAST_MINUTE_TICKET_SOURCES.find((source) => normalized.includes(source.domain));
}
