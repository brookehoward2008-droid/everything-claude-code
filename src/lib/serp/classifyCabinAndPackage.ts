// src/lib/serp/classifyCabinAndPackage.ts
// Purpose: Detect balcony/suite/all-inclusive package signals from SerpApi result text.

import {
  ALL_INCLUSIVE_PACKAGE_TERMS,
  CABIN_TERMS,
} from "./cruiseCabinPackageTerms";

export type CabinPackageClassification = {
  cabinMatch: "suite" | "balcony" | "unknown";
  hasBundledInclusions: boolean;
  badges: string[];
  riskFlags: string[];
};

type ResultLike = {
  title?: string;
  link?: string;
  displayed_link?: string;
  snippet?: string;
  source?: string;
  date?: string;
};

function textOf(result: ResultLike): string {
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

function includesAny(text: string, terms: readonly string[]): boolean {
  return terms.some((term) => text.includes(term.toLowerCase()));
}

export function classifyCabinAndPackage(
  result: ResultLike,
): CabinPackageClassification {
  const text = textOf(result);
  const badges: string[] = [];
  const riskFlags: string[] = [];

  let cabinMatch: CabinPackageClassification["cabinMatch"] = "unknown";

  if (includesAny(text, CABIN_TERMS.suite)) {
    cabinMatch = "suite";
    badges.push("SUITE_PREFERRED", "BALCONY_OR_BETTER");
  } else if (includesAny(text, CABIN_TERMS.balcony)) {
    cabinMatch = "balcony";
    badges.push("BALCONY_OR_BETTER");
  }

  const hasBundledInclusions = includesAny(text, ALL_INCLUSIVE_PACKAGE_TERMS);

  if (hasBundledInclusions) {
    badges.push("BUNDLED_INCLUSIONS");
  }

  if (text.includes("free at sea")) badges.push("NCL_FREE_AT_SEA");
  if (text.includes("princess plus")) badges.push("PRINCESS_PLUS");
  if (text.includes("princess premier")) badges.push("PRINCESS_PREMIER");
  if (text.includes("all included")) badges.push("CELEBRITY_ALL_INCLUDED");
  if (text.includes("have it all")) badges.push("HAL_HAVE_IT_ALL");

  if (text.includes("gratuities") || text.includes("tips included")) {
    badges.push("GRATUITIES_INCLUDED");
  }

  if (text.includes("drink") || text.includes("beverage")) {
    badges.push("DRINKS_INCLUDED");
  }

  if (text.includes("wi-fi") || text.includes("wifi")) {
    badges.push("WIFI_INCLUDED");
  }

  if (text.includes("service charge") || text.includes("taxes") || text.includes("port fees")) {
    riskFlags.push("EXTRA_FEES_POSSIBLE");
  }

  return {
    cabinMatch,
    hasBundledInclusions,
    badges: [...new Set(badges)],
    riskFlags: [...new Set(riskFlags)],
  };
}
