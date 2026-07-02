// src/lib/serp/extractCruiseDealSignals.ts
// Purpose: Extract stronger deal signals from cruise SERP snippets.

export type CruiseDealSignals = {
  routeType: "roundtrip_seattle" | "seattle_departure" | "unknown";
  shipName?: string;
  sailingDate?: string;
  packageName?: "Have It All" | "Free at Sea" | "Princess Plus" | "Princess Premier" | "All Included";
  inclusionSignals: string[];
  badges: string[];
  riskFlags: string[];
};

const SHIP_NAMES = [
  "Noordam",
  "Koningsdam",
  "Eurodam",
  "Westerdam",
  "Nieuw Amsterdam",
  "Discovery Princess",
  "Norwegian Bliss",
  "Norwegian Encore",
  "Anthem",
];

function includes(text: string, term: string): boolean {
  return text.toLowerCase().includes(term.toLowerCase());
}

function findShipName(text: string): string | undefined {
  return SHIP_NAMES.find((ship) => includes(text, ship));
}

function findSailingDate(text: string): string | undefined {
  const match = text.match(
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},\s+\d{4}\b/i,
  );

  return match?.[0];
}

export function extractCruiseDealSignals(textInput: string): CruiseDealSignals {
  const text = textInput.toLowerCase();

  const badges: string[] = [];
  const riskFlags: string[] = [];
  const inclusionSignals: string[] = [];

  let routeType: CruiseDealSignals["routeType"] = "unknown";

  if (text.includes("from seattle to seattle") || text.includes("seattle to seattle")) {
    routeType = "roundtrip_seattle";
    badges.push("SEATTLE_ROUNDTRIP");
  } else if (text.includes("from seattle") || text.includes("departing from seattle")) {
    routeType = "seattle_departure";
    badges.push("SEATTLE_DEPARTURE");
  }

  let packageName: CruiseDealSignals["packageName"];

  if (text.includes("have it all")) {
    packageName = "Have It All";
    badges.push("HAVE_IT_ALL", "BUNDLED_INCLUSIONS");
  }

  if (text.includes("free at sea")) {
    packageName = "Free at Sea";
    badges.push("FREE_AT_SEA", "BUNDLED_INCLUSIONS");
  }

  if (text.includes("princess plus")) {
    packageName = "Princess Plus";
    badges.push("PRINCESS_PLUS", "BUNDLED_INCLUSIONS");
  }

  if (text.includes("princess premier")) {
    packageName = "Princess Premier";
    badges.push("PRINCESS_PREMIER", "BUNDLED_INCLUSIONS");
  }

  if (text.includes("all included")) {
    packageName = "All Included";
    badges.push("CELEBRITY_ALL_INCLUDED", "BUNDLED_INCLUSIONS");
  }

  if (text.includes("drinks")) {
    inclusionSignals.push("drinks");
    badges.push("DRINKS_INCLUDED_SIGNAL");
  }

  if (text.includes("dining")) {
    inclusionSignals.push("dining");
    badges.push("DINING_INCLUDED_SIGNAL");
  }

  if (text.includes("shore ex credit") || text.includes("shore excursion credit")) {
    inclusionSignals.push("shore excursion credit");
    badges.push("SHORE_EXCURSION_CREDIT");
  }

  if (text.includes("wi-fi") || text.includes("wifi")) {
    inclusionSignals.push("wifi");
    badges.push("WIFI_INCLUDED_SIGNAL");
  }

  if (text.includes("each guest in a stateroom must book")) {
    riskFlags.push("ALL_GUESTS_MUST_BOOK_PACKAGE_FARE");
  }

  if (!text.includes("suite price") && text.includes("suite")) {
    riskFlags.push("SUITE_PRICE_NOT_CONFIRMED");
  }

  if (!text.includes("child") && !text.includes("kids")) {
    riskFlags.push("CHILD_PRICE_NOT_CONFIRMED");
  }

  if (text.includes("alaska")) {
    riskFlags.push("ALASKA_NOT_WARM_DESTINATION");
  }

  if (!text.includes("$")) {
    riskFlags.push("FINAL_TOTAL_UNKNOWN");
  }

  const shipName = findShipName(textInput);
  const sailingDate = findSailingDate(textInput);

  if (shipName) badges.push("SHIP_IDENTIFIED");
  if (sailingDate) badges.push("SPECIFIC_SAILING_DATE");

  return {
    routeType,
    shipName,
    sailingDate,
    packageName,
    inclusionSignals: [...new Set(inclusionSignals)],
    badges: [...new Set(badges)],
    riskFlags: [...new Set(riskFlags)],
  };
}
