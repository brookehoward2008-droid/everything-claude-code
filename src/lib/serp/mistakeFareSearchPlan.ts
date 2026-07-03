// src/lib/serp/mistakeFareSearchPlan.ts
// Purpose: Query plan for finding Going.com-style mistake fares without mixing live leads, education pages, reviews, and social chatter.

import { MISTAKE_FARE_AGENTS } from "./mistakeFareAgents";

export type MistakeFareSearchPlanItem = {
  agentId: string;
  query: string;
  priority: 1 | 2 | 3;
  reason: string;
};

export const MISTAKE_FARE_SEARCH_PLAN: MistakeFareSearchPlanItem[] = [
  {
    agentId: "current-mistake-fare-hunter",
    query: "mistake fares today",
    priority: 1,
    reason: "Best broad query for current or same-day mistake-fare discovery.",
  },
  {
    agentId: "current-mistake-fare-hunter",
    query: "current mistake fares",
    priority: 1,
    reason: "Targets live-list language without limiting results to one provider.",
  },
  {
    agentId: "current-mistake-fare-hunter",
    query: "error fare today flight deal",
    priority: 1,
    reason: "Catches sources using error fare instead of mistake fare.",
  },
  {
    agentId: "going-official-monitor",
    query: "site:going.com mistake fares current",
    priority: 1,
    reason: "Restricts to Going official pages for mistake-fare language.",
  },
  {
    agentId: "going-official-monitor",
    query: "site:going.com flight alerts mistake fares",
    priority: 1,
    reason: "Targets official Going pages that mention alerts and mistake fares.",
  },
  {
    agentId: "mistake-fare-education-monitor",
    query: "Going.com mistake fare ticketing error currency mismatch",
    priority: 2,
    reason: "Finds explanation pages about causes of mistake fares.",
  },
  {
    agentId: "third-party-analysis-monitor",
    query: "Forbes mistake airfares Going.com canceled percentage",
    priority: 2,
    reason: "Finds independent safety analysis and cancellation-risk context.",
  },
  {
    agentId: "airline-policy-monitor",
    query: "do airlines have to honor mistake fares",
    priority: 2,
    reason: "Finds fare-honoring and cancellation policy context before alerts are trusted.",
  },
  {
    agentId: "going-social-proof-monitor",
    query: "Going.com mistake fare booked reddit",
    priority: 3,
    reason: "Social proof only; never enough for a verified alert by itself.",
  },
  {
    agentId: "going-review-reputation-monitor",
    query: "Going.com reviews complaints",
    priority: 3,
    reason: "Reputation context only; not a live fare source.",
  },
];

export function getMistakeFareSearchPlan(priority?: 1 | 2 | 3): MistakeFareSearchPlanItem[] {
  if (!priority) return MISTAKE_FARE_SEARCH_PLAN;
  return MISTAKE_FARE_SEARCH_PLAN.filter((item) => item.priority === priority);
}

export function getMistakeFareAgentSearchPlan(agentId: string): MistakeFareSearchPlanItem[] {
  const agentExists = MISTAKE_FARE_AGENTS.some((agent) => agent.id === agentId);
  if (!agentExists) return [];

  return MISTAKE_FARE_SEARCH_PLAN.filter((item) => item.agentId === agentId);
}
