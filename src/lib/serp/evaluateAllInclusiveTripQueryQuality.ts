// src/lib/serp/evaluateAllInclusiveTripQueryQuality.ts
// Purpose: Decide whether an all-inclusive vacation SERP query is usable for source discovery, deal discovery, or final-price monitoring.

export type AllInclusiveTripQueryPurpose = "source_discovery" | "deal_discovery" | "final_price_monitoring";

export type AllInclusiveTripQueryQuality = {
  purpose: AllInclusiveTripQueryPurpose;
  quality: "good" | "mixed" | "poor";
  problems: string[];
  requiredFollowUpQueries: string[];
};

type ResultLike = {
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
};

type EvaluateAllInclusiveTripQueryQualityInput = {
  query: string;
  organicResults: ResultLike[];
  travelerCount?: number;
  originAirport?: string;
  targetBudgetUsd?: number;
};

const BROAD_WORDS = ["huge discount", "best", "cheap", "trips"];
const PRICE_TERMS = ["under $", "$", "from $"];
const PACKAGE_TERMS = ["airfare", "flight", "hotel", "resort", "all inclusive", "all-inclusive"];

function textOf(result: ResultLike): string {
  return [result.title, result.link, result.snippet, result.source].filter(Boolean).join(" ").toLowerCase();
}

function includesAny(text: string, terms: readonly string[]): boolean {
  return terms.some((term) => text.includes(term));
}

export function evaluateAllInclusiveTripQueryQuality(
  input: EvaluateAllInclusiveTripQueryQualityInput,
): AllInclusiveTripQueryQuality {
  const normalizedQuery = input.query.toLowerCase();
  const allResultText = input.organicResults.map(textOf).join(" ");
  const problems: string[] = [];
  const requiredFollowUpQueries: string[] = [];

  const isBroad = BROAD_WORDS.some((word) => normalizedQuery.includes(word));
  const hasDestination = /cancun|punta cana|tulum|riviera maya|jamaica|mexico|caribbean|dominican republic/i.test(input.query);
  const hasOrigin = Boolean(input.originAirport) || /from\s+[a-z]{3}\b|from\s+seattle|sea-tac|seatac/i.test(input.query);
  const hasPriceTarget = PRICE_TERMS.some((term) => normalizedQuery.includes(term));
  const hasPackageIntent = PACKAGE_TERMS.some((term) => normalizedQuery.includes(term));

  let purpose: AllInclusiveTripQueryPurpose = "source_discovery";

  if (hasDestination || hasOrigin || hasPriceTarget) purpose = "deal_discovery";
  if (hasDestination && hasOrigin && hasPriceTarget && input.travelerCount) purpose = "final_price_monitoring";

  if (isBroad && purpose === "source_discovery") problems.push("BROAD_SOURCE_DISCOVERY_ONLY");
  if (!hasPackageIntent) problems.push("PACKAGE_INTENT_WEAK");
  if (!hasDestination && purpose !== "source_discovery") problems.push("DESTINATION_MISSING");
  if (!hasOrigin && purpose === "final_price_monitoring") problems.push("ORIGIN_MISSING");
  if (!hasPriceTarget && purpose === "final_price_monitoring") problems.push("BUDGET_OR_PRICE_TARGET_MISSING");

  const priceSignals = input.organicResults.filter((result) => textOf(result).includes("$")).length;
  if (priceSignals === 0) problems.push("NO_PRICE_SIGNALS_IN_RESULTS");

  const videoResults = input.organicResults.filter((result) => textOf(result).includes("youtube.com")).length;
  if (videoResults >= 2) problems.push("VIDEO_RESEARCH_NOISE");

  const socialResults = input.organicResults.filter((result) => {
    const text = textOf(result);
    return text.includes("reddit.com") || text.includes("facebook.com");
  }).length;
  if (socialResults >= 2) problems.push("SOCIAL_SOURCE_NOISE");

  const preferredOrigin = input.originAirport ?? "SEA";
  const preferredBudget = input.targetBudgetUsd ?? 10000;

  requiredFollowUpQueries.push(`all inclusive vacation packages from ${preferredOrigin} for 2 adults 1 child`);
  requiredFollowUpQueries.push(`all inclusive resort packages with airfare from ${preferredOrigin} under $${preferredBudget}`);
  requiredFollowUpQueries.push(`Cancun all inclusive package from ${preferredOrigin} family under $${preferredBudget}`);
  requiredFollowUpQueries.push(`Punta Cana all inclusive package from ${preferredOrigin} family under $${preferredBudget}`);
  requiredFollowUpQueries.push(`site:allinclusiveoutlet.com family all inclusive from ${preferredOrigin}`);
  requiredFollowUpQueries.push(`site:cheapcaribbean.com all inclusive package from ${preferredOrigin}`);
  requiredFollowUpQueries.push(`site:applevacations.com all inclusive deals from ${preferredOrigin}`);

  return {
    purpose,
    quality: problems.length >= 4 ? "poor" : problems.length >= 1 ? "mixed" : "good",
    problems: [...new Set(problems)],
    requiredFollowUpQueries: [...new Set(requiredFollowUpQueries)],
  };
}
