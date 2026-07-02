// src/lib/serp/cabinCategoryRules.ts
// Purpose: Detect cabin-category eligibility language from cruise deal snippets.

export type CabinCategorySignal = {
  cabinCategoryCodes: string[];
  hasCategoryEligibility: boolean;
  notes: string[];
};

const CABIN_CATEGORY_PATTERN = /\b(?:categories|category)\s+([A-Z]{1,2}(?:,\s*[A-Z]{1,2})*)/i;

export function extractCabinCategorySignal(text: string): CabinCategorySignal {
  const notes: string[] = [];
  const match = text.match(CABIN_CATEGORY_PATTERN);

  if (!match) {
    return {
      cabinCategoryCodes: [],
      hasCategoryEligibility: false,
      notes,
    };
  }

  const cabinCategoryCodes = match[1]
    .split(",")
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);

  notes.push(`Detected cabin category eligibility: ${cabinCategoryCodes.join(", ")}`);

  return {
    cabinCategoryCodes,
    hasCategoryEligibility: cabinCategoryCodes.length > 0,
    notes,
  };
}
