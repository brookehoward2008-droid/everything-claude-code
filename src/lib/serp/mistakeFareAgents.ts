// src/lib/serp/mistakeFareAgents.ts
// Purpose: Agent definitions for finding Going.com-style mistake fares, fare glitches, and ultra-low flight deal signals from SerpApi results.

export type MistakeFareAgentKind =
  | "official_going_monitor"
  | "mistake_fare_education"
  | "current_mistake_fare_hunter"
  | "third_party_analysis"
  | "review_reputation_monitor"
  | "social_proof_monitor"
  | "airline_policy_monitor";

export type MistakeFareAgent = {
  id: string;
  kind: MistakeFareAgentKind;
  label: string;
  goal: string;
  queries: string[];
  acceptSignals: MistakeFareSignal[];
  rejectSignals: MistakeFareRejectSignal[];
  riskFlags: MistakeFareRiskFlag[];
};

export type MistakeFareSignal =
  | "GOING_OFFICIAL"
  | "MISTAKE_FARE"
  | "ERROR_FARE"
  | "GLITCH_FARE"
  | "PRICE_DROP"
  | "ULTRA_LOW_FARE"
  | "CURRENT_OR_TODAY"
  | "EMAIL_ALERT"
  | "CURRENCY_MISMATCH"
  | "TICKETING_ERROR"
  | "BOOKING_GUIDE"
  | "CANCELLATION_RATE"
  | "REVIEW_RATING"
  | "SOCIAL_EXPERIENCE";

export type MistakeFareRejectSignal =
  | "AIRLINE_RANKING_ONLY"
  | "GENERAL_WORST_AIRLINE_QUERY"
  | "OLD_BEST_DEALS_LIST"
  | "UNVERIFIED_SOCIAL_ONLY"
  | "REVIEW_ONLY"
  | "NO_BOOKABLE_FARE"
  | "GENERIC_CHEAP_FLIGHT_PAGE";

export type MistakeFareRiskFlag =
  | "MISTAKE_FARE_CAN_BE_CANCELED"
  | "WAIT_BEFORE_NONREFUNDABLE_PLANS"
  | "AIRLINE_MAY_NOT_HONOR"
  | "PRICE_MAY_DISAPPEAR_FAST"
  | "CHECK_DIRECT_BOOKING_TOTAL"
  | "BAG_FEES_SEAT_FEES_OR_BASIC_ECONOMY"
  | "SOCIAL_SOURCE_UNVERIFIED"
  | "REVIEW_SOURCE_ONLY"
  | "HISTORICAL_DEAL_NOT_CURRENT";

export const MISTAKE_FARE_AGENTS: MistakeFareAgent[] = [
  {
    id: "going-official-monitor",
    kind: "official_going_monitor",
    label: "Going Official Monitor",
    goal: "Find official Going pages that mention flight alerts, mistake fares, big price drops, cheap tickets, and current deal-alert positioning.",
    queries: [
      "site:going.com mistake fares current",
      "site:going.com flight alerts mistake fares",
      "site:going.com cheap flights mistake fares",
      "site:going.com deals mistake fare today",
      "site:going.com flights error fares",
    ],
    acceptSignals: ["GOING_OFFICIAL", "MISTAKE_FARE", "PRICE_DROP", "EMAIL_ALERT", "ULTRA_LOW_FARE"],
    rejectSignals: ["REVIEW_ONLY", "UNVERIFIED_SOCIAL_ONLY"],
    riskFlags: ["PRICE_MAY_DISAPPEAR_FAST", "CHECK_DIRECT_BOOKING_TOTAL"],
  },
  {
    id: "mistake-fare-education-monitor",
    kind: "mistake_fare_education",
    label: "Mistake Fare Education Monitor",
    goal: "Collect rule pages explaining what mistake fares are, why they happen, and how to book safely.",
    queries: [
      "Going.com guide mistake fares",
      "Going.com mistake fare ticketing error currency mismatch",
      "mistake fares error fares glitch fares booking guide",
      "do airlines honor mistake fares",
      "mistake fare canceled wait before hotel booking",
    ],
    acceptSignals: ["MISTAKE_FARE", "ERROR_FARE", "GLITCH_FARE", "TICKETING_ERROR", "CURRENCY_MISMATCH", "BOOKING_GUIDE", "CANCELLATION_RATE"],
    rejectSignals: ["NO_BOOKABLE_FARE"],
    riskFlags: ["MISTAKE_FARE_CAN_BE_CANCELED", "WAIT_BEFORE_NONREFUNDABLE_PLANS", "AIRLINE_MAY_NOT_HONOR"],
  },
  {
    id: "current-mistake-fare-hunter",
    kind: "current_mistake_fare_hunter",
    label: "Current Mistake Fare Hunter",
    goal: "Search for live or very recent mistake-fare lists, current cheap-flight alerts, and today-style fare drops.",
    queries: [
      "mistake fares today",
      "current mistake fares",
      "mistake fare alert today",
      "error fare today flight deal",
      "glitch fare today flight deal",
      "Going.com deals current mistake fare",
      "Going email list mistake fare",
    ],
    acceptSignals: ["MISTAKE_FARE", "ERROR_FARE", "GLITCH_FARE", "CURRENT_OR_TODAY", "PRICE_DROP", "ULTRA_LOW_FARE"],
    rejectSignals: ["OLD_BEST_DEALS_LIST", "GENERIC_CHEAP_FLIGHT_PAGE", "NO_BOOKABLE_FARE"],
    riskFlags: ["PRICE_MAY_DISAPPEAR_FAST", "CHECK_DIRECT_BOOKING_TOTAL", "BAG_FEES_SEAT_FEES_OR_BASIC_ECONOMY"],
  },
  {
    id: "third-party-analysis-monitor",
    kind: "third_party_analysis",
    label: "Third-Party Analysis Monitor",
    goal: "Find reputable third-party explanations of mistake fares, cancellation rates, booking timing, and fare-honoring risk.",
    queries: [
      "Forbes mistake airfares Going.com canceled percentage",
      "mistake airfare cancellation rate Going.com",
      "how to find mistake airfares and save hundreds",
      "mistake fares airline honor policy",
    ],
    acceptSignals: ["MISTAKE_FARE", "CANCELLATION_RATE", "BOOKING_GUIDE"],
    rejectSignals: ["UNVERIFIED_SOCIAL_ONLY"],
    riskFlags: ["MISTAKE_FARE_CAN_BE_CANCELED", "WAIT_BEFORE_NONREFUNDABLE_PLANS", "AIRLINE_MAY_NOT_HONOR"],
  },
  {
    id: "going-review-reputation-monitor",
    kind: "review_reputation_monitor",
    label: "Going Reputation Monitor",
    goal: "Track review and complaint sources for Going.com so deal alerts can include source confidence and user-experience risk.",
    queries: [
      "Going.com reviews complaints",
      "Going app reviews",
      "Going.com Trustpilot reviews",
      "Is Going.com legit",
    ],
    acceptSignals: ["REVIEW_RATING"],
    rejectSignals: ["NO_BOOKABLE_FARE", "REVIEW_ONLY"],
    riskFlags: ["REVIEW_SOURCE_ONLY"],
  },
  {
    id: "going-social-proof-monitor",
    kind: "social_proof_monitor",
    label: "Going Social Proof Monitor",
    goal: "Capture Reddit and social reports that mention real booked mistake fares, but keep them out of verified-deal scoring until confirmed elsewhere.",
    queries: [
      "Going.com mistake fare reddit",
      "Going.com still good for cheap flights reddit",
      "Going.com mistake fare booked reddit",
      "Scott's Cheap Flights Going mistake fare reddit",
    ],
    acceptSignals: ["SOCIAL_EXPERIENCE", "MISTAKE_FARE"],
    rejectSignals: ["UNVERIFIED_SOCIAL_ONLY"],
    riskFlags: ["SOCIAL_SOURCE_UNVERIFIED", "PRICE_MAY_DISAPPEAR_FAST"],
  },
  {
    id: "airline-policy-monitor",
    kind: "airline_policy_monitor",
    label: "Airline Honor Policy Monitor",
    goal: "Find whether airlines may cancel, honor, or claw back mistake fares before the app tells the user to book connected travel.",
    queries: [
      "do airlines have to honor mistake fares",
      "airline mistake fare cancellation policy",
      "DOT mistake fares airline honor",
      "mistake fare canceled after booking hotel warning",
    ],
    acceptSignals: ["MISTAKE_FARE", "BOOKING_GUIDE", "CANCELLATION_RATE"],
    rejectSignals: ["AIRLINE_RANKING_ONLY", "GENERAL_WORST_AIRLINE_QUERY"],
    riskFlags: ["MISTAKE_FARE_CAN_BE_CANCELED", "WAIT_BEFORE_NONREFUNDABLE_PLANS", "AIRLINE_MAY_NOT_HONOR"],
  },
];

export function getMistakeFareAgentById(agentId: string): MistakeFareAgent | undefined {
  return MISTAKE_FARE_AGENTS.find((agent) => agent.id === agentId);
}

export function getMistakeFareAgentQueries(): string[] {
  return MISTAKE_FARE_AGENTS.flatMap((agent) => agent.queries);
}
