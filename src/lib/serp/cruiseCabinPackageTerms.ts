// src/lib/serp/cruiseCabinPackageTerms.ts
// Purpose: Define cabin and package language for the Seattle cruise deal watcher.

export const CABIN_TERMS = {
  balcony: [
    "balcony",
    "veranda",
    "verandah",
    "balcony stateroom",
    "veranda stateroom",
    "verandah stateroom",
  ],
  suite: [
    "suite",
    "mini-suite",
    "club suite",
    "haven",
    "the retreat",
    "retreat suite",
    "family suite",
    "signature suite",
    "neptune suite",
    "vista suite",
    "pinnacle suite",
  ],
} as const;

export const ALL_INCLUSIVE_PACKAGE_TERMS = [
  "all inclusive",
  "all-inclusive",
  "all included",
  "drinks included",
  "wi-fi included",
  "wifi included",
  "tips included",
  "gratuities included",
  "specialty dining included",
  "onboard credit",
  "shore excursion credit",
  "shore ex credit",
  "free at sea",
  "princess plus",
  "princess premier",
  "celebrity all included",
  "have it all",
] as const;

export const MUST_HAVE_BADGES = [
  "BALCONY_OR_BETTER",
  "BUNDLED_INCLUSIONS",
] as const;

export const PREFERRED_BADGES = [
  "SUITE_PREFERRED",
  "KIDS_FREE_CLAIM",
  "GRATUITIES_INCLUDED",
  "DRINKS_INCLUDED",
  "WIFI_INCLUDED",
] as const;
