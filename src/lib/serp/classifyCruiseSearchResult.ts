// src/lib/serp/classifyCruiseSearchResult.ts
// Purpose: Classify cruise SERP results so the app separates real deal leads from rules, research, warnings, and stale offers.

export type CruiseResultKind =
  | "official_rule"
  | "official_offer"
  | "agency_offer"
  | "editorial_research"
  | "social_warning"
  | "stale_offer"
  | "unknown";

export type CruiseResultClassification = {
  kind: CruiseResultKind;
  badges: string[];
  riskFlags: string[];
};

export type CruiseSearchResultLike = {
  title?: string;
  link?: string;
  displayed_link?: string;
  snippet?: string;
  source?: string;
  date?: string;
};

const SOCIAL_DOMAINS = [
  "reddit.com",
  "facebook.com",
  "instagram.com",
  "x.com",
  "tiktok.com",
];

const OFFICIAL_CRUISE_DOMAINS = [
  "royalcaribbean.com",
  "ncl.com",
  "princess.com",
  "carnival.com",
  "celebritycruises.com",
  "hollandamerica.com",
  "msccruisesusa.com",
];

const AGENCY_DOMAINS = [
  "southwestcruises.com",
  "cruisedirect.com",
  "cruise.com",
  "cruises.com",
  "vacationstogo.com",
  "costcotravel.com",
  "alaskacruises.com",
  "expediacruises.com",
];

const EDITORIAL_DOMAINS = [
  "cruisecritic.com",
  "travel.usnews.com",
  "allthingscruise.com",
  "prnewswire.com",
];

const STALE_MARKERS = [
  "2009",
  "2014",
  "2021",
  "2022",
  "2023",
  "2024",
  "dash-july2014",
];

const RULE_MARKERS = [
  "faq",
  "qualify",
  "what is kids sail free",
  "limited to",
  "triple",
  "quad",
  "family occupancy",
  "12 or younger",
  "each guest in a stateroom must book",
];

const OFFER_MARKERS = [
  "kids sail free",
  "free upgrades",
  "free onboard credit",
  "50% off",
  "limited time",
  "deal",
  "promotion",
  "bonus offers",
  "stateroom",
  "suite",
  "haven",
  "have it all",
  "free at sea",
  "princess plus",
  "all included",
];

function includesAny(text: string, terms: readonly string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function getText(result: CruiseSearchResultLike): string {
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

export function classifyCruiseSearchResult(
  result: CruiseSearchResultLike,
): CruiseResultClassification {
  const text = getText(result);
  const badges: string[] = [];
  const riskFlags: string[] = [];

  if (includesAny(text, OFFER_MARKERS)) badges.push("DEAL_OR_PACKAGE_SIGNAL");

  if (text.includes("suite") || text.includes("stateroom") || text.includes("haven")) {
    badges.push("ROOM_TYPE_RELEVANT");
  }

  if (text.includes("seattle")) badges.push("SEATTLE_MATCH");

  if (text.includes("free onboard credit")) badges.push("ONBOARD_CREDIT");
  if (text.includes("free upgrades")) badges.push("FREE_UPGRADE_CLAIM");

  if (includesAny(text, RULE_MARKERS)) {
    badges.push("QUALIFICATION_RULE");
    riskFlags.push("OCCUPANCY_OR_PACKAGE_RESTRICTION");
  }

  if (includesAny(text, STALE_MARKERS)) riskFlags.push("STALE_DATE_RISK");

  if (includesAny(text, SOCIAL_DOMAINS)) {
    return {
      kind: "social_warning",
      badges: [...new Set([...badges, "SOCIAL_SIGNAL"])],
      riskFlags: [...new Set([...riskFlags, "UNVERIFIED_SOCIAL_SOURCE"])],
    };
  }

  if (includesAny(text, STALE_MARKERS) && !text.includes("2027")) {
    return { kind: "stale_offer", badges: [...new Set(badges)], riskFlags: [...new Set(riskFlags)] };
  }

  if (includesAny(text, OFFICIAL_CRUISE_DOMAINS) && includesAny(text, RULE_MARKERS)) {
    return { kind: "official_rule", badges: [...new Set(badges)], riskFlags: [...new Set(riskFlags)] };
  }

  if (includesAny(text, OFFICIAL_CRUISE_DOMAINS) && includesAny(text, OFFER_MARKERS)) {
    return { kind: "official_offer", badges: [...new Set(badges)], riskFlags: [...new Set(riskFlags)] };
  }

  if (includesAny(text, AGENCY_DOMAINS) && includesAny(text, OFFER_MARKERS)) {
    return { kind: "agency_offer", badges: [...new Set(badges)], riskFlags: [...new Set(riskFlags)] };
  }

  if (includesAny(text, EDITORIAL_DOMAINS)) {
    return { kind: "editorial_research", badges: [...new Set(badges)], riskFlags: [...new Set(riskFlags)] };
  }

  return { kind: "unknown", badges: [...new Set(badges)], riskFlags: [...new Set(riskFlags)] };
}
