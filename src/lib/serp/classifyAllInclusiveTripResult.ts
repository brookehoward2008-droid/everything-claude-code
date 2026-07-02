// src/lib/serp/classifyAllInclusiveTripResult.ts
// Purpose: Classify all-inclusive land-trip SERP results separately from cruise deals.

import { findAllInclusiveSource } from "./allInclusiveTripSources";

export type AllInclusiveTripResultKind =
  | "primary_deal_source"
  | "deal_collection"
  | "research_or_review"
  | "social_signal"
  | "video_research"
  | "unknown";

export type AllInclusiveTripResultClassification = {
  kind: AllInclusiveTripResultKind;
  sourceName?: string;
  badges: string[];
  riskFlags: string[];
};

export type AllInclusiveTripResultLike = {
  title?: string;
  link?: string;
  displayed_link?: string;
  snippet?: string;
  source?: string;
  date?: string;
};

const DEAL_TERMS = [
  "deal",
  "deals",
  "discount",
  "save",
  "savings",
  "off",
  "sale",
  "last minute",
  "ending soon",
  "exclusive",
  "best price promise",
  "unbeatable",
];

const PACKAGE_TERMS = [
  "all inclusive",
  "all-inclusive",
  "vacation package",
  "resort deal",
  "meals",
  "drinks",
  "activities included",
  "flights to resorts",
  "airfare included",
  "one price",
];

const DESTINATION_TERMS = [
  "cancun",
  "cozumel",
  "isla mujeres",
  "riviera maya",
  "tulum",
  "dominican republic",
  "punta cana",
  "caribbean",
  "mexico",
  "beach",
  "tropical",
];

function getText(result: AllInclusiveTripResultLike): string {
  return [result.title, result.link, result.displayed_link, result.snippet, result.source, result.date]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text: string, terms: readonly string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function extractPercentOff(text: string): string[] {
  const matches = text.match(/\b(?:up to\s+)?\d{1,2}%\s+off\b/gi) ?? [];
  return matches.map((match) => match.toUpperCase());
}

function extractDollarSavings(text: string): string[] {
  const matches = text.match(/\bsave\s+\$\d{2,5}\b/gi) ?? [];
  return matches.map((match) => match.toUpperCase().replaceAll(" ", "_"));
}

export function classifyAllInclusiveTripResult(
  result: AllInclusiveTripResultLike,
): AllInclusiveTripResultClassification {
  const text = getText(result);
  const source = findAllInclusiveSource(text);
  const badges: string[] = [];
  const riskFlags: string[] = [];

  if (includesAny(text, DEAL_TERMS)) badges.push("DEAL_SIGNAL");
  if (includesAny(text, PACKAGE_TERMS)) badges.push("ALL_INCLUSIVE_PACKAGE_SIGNAL");
  if (includesAny(text, DESTINATION_TERMS)) badges.push("WARM_DESTINATION_SIGNAL");

  for (const percent of extractPercentOff(text)) badges.push(`PERCENT_DISCOUNT:${percent.replaceAll(" ", "_")}`);
  for (const savings of extractDollarSavings(text)) badges.push(`DOLLAR_SAVINGS:${savings}`);

  if (text.includes("adults only")) badges.push("ADULTS_ONLY");
  if (text.includes("family")) badges.push("FAMILY_SIGNAL");
  if (text.includes("airfare") || text.includes("flights")) badges.push("AIRFARE_SIGNAL");
  if (text.includes("last minute")) badges.push("LAST_MINUTE_SIGNAL");

  if (!text.includes("$")) riskFlags.push("FINAL_PRICE_UNKNOWN");
  if (!text.includes("airfare") && !text.includes("flight")) riskFlags.push("AIRFARE_NOT_CONFIRMED");
  if (!text.includes("child") && !text.includes("family")) riskFlags.push("CHILD_PRICE_NOT_CONFIRMED");

  if (source?.tier === "social_signal") {
    riskFlags.push("UNVERIFIED_SOCIAL_SOURCE");
  }

  if (source?.tier === "research_or_review") {
    riskFlags.push("REVIEW_SOURCE_NOT_BOOKING_SOURCE");
  }

  if (text.includes("youtube.com") || text.includes("youtu.be")) {
    return {
      kind: "video_research",
      sourceName: result.source,
      badges: [...new Set([...badges, "VIDEO_RESEARCH"])],
      riskFlags: [...new Set([...riskFlags, "VIDEO_NOT_BOOKING_SOURCE"])],
    };
  }

  return {
    kind: source?.tier ?? "unknown",
    sourceName: source?.displayName ?? result.source,
    badges: [...new Set(badges)],
    riskFlags: [...new Set(riskFlags)],
  };
}
