// src/lib/serp/freeTravelPromotionSources.ts
// Purpose: Source and risk definitions for free-travel, hotel, flight, and vacation-promotion SERP monitoring.

export type FreeTravelPromotionSourceTier =
  | "official_promo_source"
  | "deal_collection"
  | "rewards_education"
  | "travel_package_source"
  | "social_signal"
  | "low_trust_source"
  | "video_research";

export type FreeTravelPromotionSourceDefinition = {
  domain: string;
  displayName: string;
  tier: FreeTravelPromotionSourceTier;
  notes: string;
};

export type FreeTravelPromotionSignal =
  | "FREE_CLAIM"
  | "POINTS_OR_MILES_REQUIRED"
  | "CREDIT_CARD_REWARDS"
  | "MEMBER_ONLY_RATE"
  | "PROMO_CODE"
  | "PACKAGE_BUNDLE"
  | "ROOM_UPGRADE"
  | "FREE_BREAKFAST"
  | "SPA_CREDIT"
  | "DOLLAR_SAVINGS"
  | "GIVEAWAY_OR_VOUCHER"
  | "LOW_INCOME_FAMILY_RESOURCE";

export type FreeTravelPromotionRiskFlag =
  | "FREE_CLAIM_NOT_VERIFIED"
  | "CREDIT_CARD_DEBT_RISK"
  | "ANNUAL_FEE_REQUIRED"
  | "POINTS_VALUE_UNKNOWN"
  | "TAXES_AND_FEES_NOT_INCLUDED"
  | "BLACKOUT_DATES_POSSIBLE"
  | "PROMO_EXPIRATION_DATE_REQUIRED"
  | "MEMBERSHIP_REQUIRED"
  | "SOCIAL_SOURCE_UNVERIFIED"
  | "LOW_TRUST_ADVICE_SOURCE"
  | "VIDEO_NOT_BOOKING_SOURCE"
  | "SCAM_RISK_REVIEW_REQUIRED";

export const FREE_TRAVEL_PROMOTION_SOURCES: FreeTravelPromotionSourceDefinition[] = [
  {
    domain: "expedia.com",
    displayName: "Expedia",
    tier: "official_promo_source",
    notes: "Member-only rates, hotel deals, room upgrades, breakfast, late checkout, and credits. Good for promo monitoring, but final total must be verified.",
  },
  {
    domain: "delta.com",
    displayName: "Delta Vacations",
    tier: "official_promo_source",
    notes: "Official airline vacation-package promo source. Useful for promo codes, flight-and-hotel package savings, and SkyMiles-related offers.",
  },
  {
    domain: "travelocity.com",
    displayName: "Travelocity",
    tier: "travel_package_source",
    notes: "Flight-and-hotel package source. Useful for bundle savings signals and package price comparison.",
  },
  {
    domain: "travelpirates.com",
    displayName: "TravelPirates",
    tier: "deal_collection",
    notes: "Deal-alert and travel-deal collection source for vacations, flights, and hotels. Verify booking details at the final provider.",
  },
  {
    domain: "seedtime.com",
    displayName: "SeedTime Money",
    tier: "rewards_education",
    notes: "Travel-rewards education source with free-flight and free-hotel claim language. Useful for strategy discovery, not verified live inventory.",
  },
  {
    domain: "perceptivetravel.com",
    displayName: "Perceptive Travel",
    tier: "rewards_education",
    notes: "Credit-card travel-rewards education source. Useful for points strategy, but requires debt, fee, and points-value risk flags.",
  },
  {
    domain: "afar.com",
    displayName: "AFAR",
    tier: "video_research",
    notes: "Travel media and education source. Video results can explain strategy, but should not count as verified deals.",
  },
  {
    domain: "youtube.com",
    displayName: "YouTube",
    tier: "video_research",
    notes: "Video research source for travel-rewards strategy. Not a booking or verified-price source.",
  },
  {
    domain: "familiesflyfree.com",
    displayName: "Families Fly Free",
    tier: "rewards_education",
    notes: "Family-focused travel-rewards education source. Useful for family strategy discovery, not live price verification.",
  },
  {
    domain: "reddit.com",
    displayName: "Reddit",
    tier: "social_signal",
    notes: "Useful for warnings, user experiences, freebie tactics, and scam signals. Never treat as verified travel inventory.",
  },
  {
    domain: "facebook.com",
    displayName: "Facebook",
    tier: "social_signal",
    notes: "Useful for social discovery and group discussion only. Giveaway, voucher, and free-flight claims need scam-risk review.",
  },
  {
    domain: "quora.com",
    displayName: "Quora",
    tier: "low_trust_source",
    notes: "Anecdotal advice source. Low scoring for booking or financial decisions.",
  },
];

export const FREE_TRAVEL_PROMOTION_TERMS: FreeTravelPromotionSignal[] = [
  "FREE_CLAIM",
  "POINTS_OR_MILES_REQUIRED",
  "CREDIT_CARD_REWARDS",
  "MEMBER_ONLY_RATE",
  "PROMO_CODE",
  "PACKAGE_BUNDLE",
  "ROOM_UPGRADE",
  "FREE_BREAKFAST",
  "SPA_CREDIT",
  "DOLLAR_SAVINGS",
  "GIVEAWAY_OR_VOUCHER",
  "LOW_INCOME_FAMILY_RESOURCE",
];

const SOURCE_TEXT_MARKERS: Record<FreeTravelPromotionSignal, string[]> = {
  FREE_CLAIM: ["free hotel", "free hotels", "free flight", "free flights", "free vacation", "free vacations", "for free"],
  POINTS_OR_MILES_REQUIRED: ["points", "miles", "skymiles", "reward", "rewards", "loyalty"],
  CREDIT_CARD_REWARDS: ["credit card", "right credit card", "card rewards", "travel rewards"],
  MEMBER_ONLY_RATE: ["member-only", "member only", "members save", "member rate"],
  PROMO_CODE: ["promo code", "coupon code", "code"],
  PACKAGE_BUNDLE: ["flight and hotel", "hotel and flight", "vacation package", "package deals", "bundle"],
  ROOM_UPGRADE: ["room upgrade", "free room upgrade", "upgrades"],
  FREE_BREAKFAST: ["free breakfast", "breakfast included"],
  SPA_CREDIT: ["spa credit", "credits"],
  DOLLAR_SAVINGS: ["save up to", "save $", "discount", "deals"],
  GIVEAWAY_OR_VOUCHER: ["giveaway", "voucher", "vouchers"],
  LOW_INCOME_FAMILY_RESOURCE: ["low income", "low-income", "families"],
};

export function findFreeTravelPromotionSource(urlOrText: string): FreeTravelPromotionSourceDefinition | undefined {
  const normalized = urlOrText.toLowerCase();
  return FREE_TRAVEL_PROMOTION_SOURCES.find((source) => normalized.includes(source.domain));
}

export function extractFreeTravelPromotionSignals(text: string): FreeTravelPromotionSignal[] {
  const normalized = text.toLowerCase();

  return FREE_TRAVEL_PROMOTION_TERMS.filter((signal) =>
    SOURCE_TEXT_MARKERS[signal].some((marker) => normalized.includes(marker)),
  );
}

export function getFreeTravelPromotionRiskFlags(text: string): FreeTravelPromotionRiskFlag[] {
  const normalized = text.toLowerCase();
  const flags = new Set<FreeTravelPromotionRiskFlag>();

  if (normalized.includes("free")) flags.add("FREE_CLAIM_NOT_VERIFIED");
  if (normalized.includes("credit card")) flags.add("CREDIT_CARD_DEBT_RISK");
  if (normalized.includes("annual fee")) flags.add("ANNUAL_FEE_REQUIRED");
  if (normalized.includes("points") || normalized.includes("miles")) flags.add("POINTS_VALUE_UNKNOWN");
  if (normalized.includes("taxes") || normalized.includes("fees")) flags.add("TAXES_AND_FEES_NOT_INCLUDED");
  if (normalized.includes("blackout")) flags.add("BLACKOUT_DATES_POSSIBLE");
  if (normalized.includes("promo code") || normalized.includes("by july") || normalized.includes("expires")) {
    flags.add("PROMO_EXPIRATION_DATE_REQUIRED");
  }
  if (normalized.includes("member-only") || normalized.includes("members save")) flags.add("MEMBERSHIP_REQUIRED");
  if (normalized.includes("reddit.com") || normalized.includes("facebook.com")) flags.add("SOCIAL_SOURCE_UNVERIFIED");
  if (normalized.includes("quora.com")) flags.add("LOW_TRUST_ADVICE_SOURCE");
  if (normalized.includes("youtube.com") || normalized.includes("watch?v=")) flags.add("VIDEO_NOT_BOOKING_SOURCE");
  if (normalized.includes("giveaway") || normalized.includes("voucher")) flags.add("SCAM_RISK_REVIEW_REQUIRED");

  return [...flags];
}
