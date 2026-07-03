// src/lib/serp/packageFeeRisk.ts
// Purpose: Detect when "included" cruise packages may still have mandatory costs.

export type PackageFeeRisk = {
  hasFeeRisk: boolean;
  riskFlags: string[];
};

const FEE_RISK_TERMS = [
  "guests are responsible",
  "responsible for the cost",
  "service charge",
  "gratuities",
  "taxes",
  "port fees",
  "beverage package cost",
  "soda package",
  "not qualify",
  "may not qualify",
  "each guest in a stateroom must book",
];

export function detectPackageFeeRisk(text: string): PackageFeeRisk {
  const normalized = text.toLowerCase();

  const riskFlags = FEE_RISK_TERMS
    .filter((term) => normalized.includes(term))
    .map((term) => `FEE_RISK:${term.toUpperCase().replaceAll(" ", "_")}`);

  return {
    hasFeeRisk: riskFlags.length > 0,
    riskFlags,
  };
}
