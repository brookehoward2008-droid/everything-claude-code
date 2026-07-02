// src/lib/serp/allInclusiveTripSources.ts
// Purpose: Known source domains for all-inclusive resort and vacation-package deal monitoring.

export type AllInclusiveSourceTier = "primary_deal_source" | "deal_collection" | "research_or_review" | "social_signal";

export type AllInclusiveSourceDefinition = {
  domain: string;
  displayName: string;
  tier: AllInclusiveSourceTier;
  notes: string;
};

export const ALL_INCLUSIVE_TRIP_SOURCES: AllInclusiveSourceDefinition[] = [
  {
    domain: "allinclusiveoutlet.com",
    displayName: "All Inclusive Outlet",
    tier: "primary_deal_source",
    notes: "Large all-inclusive resort marketplace. Good for source discovery and package price monitoring.",
  },
  {
    domain: "applevacations.com",
    displayName: "Apple Vacations",
    tier: "primary_deal_source",
    notes: "Vacation-package seller with all-inclusive resort deals and airfare-package language.",
  },
  {
    domain: "cheapcaribbean.com",
    displayName: "CheapCaribbean",
    tier: "primary_deal_source",
    notes: "Strong source for Caribbean and Mexico all-inclusive packages and tropical deal pages.",
  },
  {
    domain: "funjet.com",
    displayName: "Funjet Vacations",
    tier: "primary_deal_source",
    notes: "Vacation-package seller. Useful when tracking packages with flights, resorts, and one-price language.",
  },
  {
    domain: "clubmed.us",
    displayName: "Club Med",
    tier: "primary_deal_source",
    notes: "Direct resort operator. Useful for percent-off promotions and ending-soon urgency language.",
  },
  {
    domain: "travelzoo.com",
    displayName: "Travelzoo",
    tier: "deal_collection",
    notes: "Deal collection and editorial sale page. Useful for large savings claims, but verify directly before purchase.",
  },
  {
    domain: "tripadvisor.com",
    displayName: "Tripadvisor",
    tier: "research_or_review",
    notes: "Review and comparison source. Useful for reputation checks, not a primary booking-source score.",
  },
  {
    domain: "reddit.com",
    displayName: "Reddit",
    tier: "social_signal",
    notes: "Useful for user warnings and source reputation, but should not be treated as verified pricing.",
  },
  {
    domain: "facebook.com",
    displayName: "Facebook",
    tier: "social_signal",
    notes: "Useful for travel-agent lead discovery only. Requires verification due to stale and unverified posts.",
  },
];

export function findAllInclusiveSource(urlOrText: string): AllInclusiveSourceDefinition | undefined {
  const normalized = urlOrText.toLowerCase();
  return ALL_INCLUSIVE_TRIP_SOURCES.find((source) => normalized.includes(source.domain));
}
