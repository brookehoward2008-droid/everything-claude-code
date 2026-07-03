// src/lib/serp/classifyMistakeFareResult.ts
// Purpose: Classify SerpApi organic results for mistake-fare and Going.com-style flight-deal agents.

import type {
  MistakeFareRejectSignal,
  MistakeFareRiskFlag,
  MistakeFareSignal,
} from "./mistakeFareAgents";

export type MistakeFareResultKind =
  | "official_going_source"
  | "current_deal_lead"
  | "mistake_fare_education"
  | "third_party_analysis"
  | "review_reputation"
  | "social_proof"
  | "airline_policy"
  | "noise";

export type MistakeFareResultLike = {
  position?: number;
  title?: string;
  link?: string;
  displayed_link?: string;
  snippet?: string;
  source?: string;
  date?: string;
  rich_snippet?: {
    top?: {
      detected_extensions?: {
        rating?: number;
        reviews?: number;
        price?: number;
        currency?: string;
      };
    };
    bottom?: {
      detected_extensions?: {
        rating?: number;
        reviews?: number;
        price?: number;
        currency?: string;
      };
    };
  };
};

export type ClassifiedMistakeFareResult = {
  kind: MistakeFareResultKind;
  score: number;
  confidence: "high" | "medium" | "low";
  signals: MistakeFareSignal[];
  rejectSignals: MistakeFareRejectSignal[];
  riskFlags: MistakeFareRiskFlag[];
  recommendedAction: string;
};

const OFFICIAL_GOING_DOMAINS = ["going.com"];
const SOCIAL_DOMAINS = ["reddit.com", "facebook.com", "instagram.com", "tiktok.com", "x.com"];
const REVIEW_DOMAINS = ["trustpilot.com", "consumeraffairs.com", "bbb.org"];
const THIRD_PARTY_ANALYSIS_DOMAINS = ["forbes.com", "nerdwallet.com", "thepointsguy.com", "cntraveler.com", "afar.com"];

const MISTAKE_FARE_TERMS = ["mistake fare", "mistake fares", "error fare", "error fares", "glitch fare", "glitch fares"];
const CURRENT_TERMS = ["today", "current", "right now", "live", "alert", "alerts", "email list"];
const POLICY_TERMS = ["honor", "honour", "canceled", "cancelled", "cancellation", "dot", "wait before", "nonrefundable"];
const NOISE_TERMS = ["worst airline", "airline to stay away", "ranking", "complaints only"];

function textOf(result: MistakeFareResultLike): string {
  return [
    result.title,
    result.link,
    result.displayed_link,
    result.snippet,
    result.source,
    result.date,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function classifyMistakeFareResult(result: MistakeFareResultLike): ClassifiedMistakeFareResult {
  const text = textOf(result);
  const signals: MistakeFareSignal[] = [];
  const rejectSignals: MistakeFareRejectSignal[] = [];
  const riskFlags: MistakeFareRiskFlag[] = [];
  let score = 0;
  let kind: MistakeFareResultKind = "noise";

  const isGoing = includesAny(text, OFFICIAL_GOING_DOMAINS);
  const isSocial = includesAny(text, SOCIAL_DOMAINS);
  const isReview = includesAny(text, REVIEW_DOMAINS);
  const isThirdParty = includesAny(text, THIRD_PARTY_ANALYSIS_DOMAINS);
  const hasMistakeFare = includesAny(text, MISTAKE_FARE_TERMS);
  const hasCurrentLanguage = includesAny(text, CURRENT_TERMS);
  const hasPolicyLanguage = includesAny(text, POLICY_TERMS);
  const hasNoiseLanguage = includesAny(text, NOISE_TERMS);

  if (isGoing) signals.push("GOING_OFFICIAL");
  if (hasMistakeFare) signals.push("MISTAKE_FARE");
  if (text.includes("error fare")) signals.push("ERROR_FARE");
  if (text.includes("glitch fare")) signals.push("GLITCH_FARE");
  if (text.includes("price drop") || text.includes("price drops")) signals.push("PRICE_DROP");
  if (text.includes("ultra-low") || text.includes("ultra low")) signals.push("ULTRA_LOW_FARE");
  if (hasCurrentLanguage) signals.push("CURRENT_OR_TODAY");
  if (text.includes("email")) signals.push("EMAIL_ALERT");
  if (text.includes("currency mismatch")) signals.push("CURRENCY_MISMATCH");
  if (text.includes("ticketing")) signals.push("TICKETING_ERROR");
  if (text.includes("guide") || text.includes("how to")) signals.push("BOOKING_GUIDE");
  if (text.includes("10%") || text.includes("20%") || text.includes("canceled") || text.includes("cancelled")) {
    signals.push("CANCELLATION_RATE");
  }
  if (isReview || typeof result.rich_snippet?.top?.detected_extensions?.rating === "number") {
    signals.push("REVIEW_RATING");
  }
  if (isSocial) signals.push("SOCIAL_EXPERIENCE");

  if (hasNoiseLanguage) rejectSignals.push("AIRLINE_RANKING_ONLY", "GENERAL_WORST_AIRLINE_QUERY");
  if (text.includes("best deals ever") || text.includes("past decade") || text.includes("10th anniversary")) {
    rejectSignals.push("OLD_BEST_DEALS_LIST");
    riskFlags.push("HISTORICAL_DEAL_NOT_CURRENT");
  }
  if (isSocial) {
    rejectSignals.push("UNVERIFIED_SOCIAL_ONLY");
    riskFlags.push("SOCIAL_SOURCE_UNVERIFIED");
  }
  if (isReview) {
    rejectSignals.push("REVIEW_ONLY");
    riskFlags.push("REVIEW_SOURCE_ONLY");
  }
  if (!hasMistakeFare && !text.includes("cheap flight") && !text.includes("flight alert")) {
    rejectSignals.push("NO_BOOKABLE_FARE");
  }
  if (text.includes("cheap flights") && !hasMistakeFare && !hasCurrentLanguage) {
    rejectSignals.push("GENERIC_CHEAP_FLIGHT_PAGE");
  }

  if (hasMistakeFare) {
    riskFlags.push("MISTAKE_FARE_CAN_BE_CANCELED", "PRICE_MAY_DISAPPEAR_FAST", "CHECK_DIRECT_BOOKING_TOTAL");
  }
  if (hasPolicyLanguage) {
    riskFlags.push("WAIT_BEFORE_NONREFUNDABLE_PLANS", "AIRLINE_MAY_NOT_HONOR");
  }
  if (text.includes("basic economy") || text.includes("bag fees") || text.includes("seat fees")) {
    riskFlags.push("BAG_FEES_SEAT_FEES_OR_BASIC_ECONOMY");
  }

  if (isGoing && hasMistakeFare && hasCurrentLanguage) {
    kind = "current_deal_lead";
    score += 85;
  } else if (isGoing && hasMistakeFare) {
    kind = "official_going_source";
    score += 70;
  } else if (isGoing && (text.includes("flight alert") || text.includes("price drop"))) {
    kind = "official_going_source";
    score += 60;
  } else if (hasPolicyLanguage && hasMistakeFare) {
    kind = "airline_policy";
    score += 55;
  } else if (isThirdParty && hasMistakeFare) {
    kind = "third_party_analysis";
    score += 50;
  } else if (hasMistakeFare && (text.includes("guide") || text.includes("how to"))) {
    kind = "mistake_fare_education";
    score += 45;
  } else if (isReview) {
    kind = "review_reputation";
    score += 20;
  } else if (isSocial && hasMistakeFare) {
    kind = "social_proof";
    score += 25;
  }

  if (signals.includes("CURRENT_OR_TODAY")) score += 15;
  if (signals.includes("PRICE_DROP")) score += 10;
  if (signals.includes("ULTRA_LOW_FARE")) score += 10;
  if (rejectSignals.includes("OLD_BEST_DEALS_LIST")) score -= 25;
  if (rejectSignals.includes("UNVERIFIED_SOCIAL_ONLY")) score -= 15;
  if (rejectSignals.includes("REVIEW_ONLY")) score -= 10;
  if (rejectSignals.includes("AIRLINE_RANKING_ONLY")) score -= 30;

  const confidence = score >= 70 ? "high" : score >= 40 ? "medium" : "low";

  return {
    kind,
    score,
    confidence,
    signals: unique(signals),
    rejectSignals: unique(rejectSignals),
    riskFlags: unique(riskFlags),
    recommendedAction: getRecommendedMistakeFareAction(kind, confidence),
  };
}

function getRecommendedMistakeFareAction(kind: MistakeFareResultKind, confidence: ClassifiedMistakeFareResult["confidence"]): string {
  if (kind === "current_deal_lead" && confidence === "high") {
    return "Verify the fare directly with the airline or booking provider immediately, then alert if total price and routing match the watch rules.";
  }

  if (kind === "official_going_source") {
    return "Save as an authoritative source for Going.com mistake-fare monitoring and use it to tune future queries.";
  }

  if (kind === "mistake_fare_education" || kind === "third_party_analysis" || kind === "airline_policy") {
    return "Save as a safety/rules source, not a live deal. Use it to explain cancellation risk and booking timing.";
  }

  if (kind === "social_proof") {
    return "Save as social proof only. Require a matching official or booking source before alerting.";
  }

  if (kind === "review_reputation") {
    return "Save as reputation context only. Do not treat as a deal source.";
  }

  return "Reject from deal alerts unless another source confirms a current, bookable fare.";
}
