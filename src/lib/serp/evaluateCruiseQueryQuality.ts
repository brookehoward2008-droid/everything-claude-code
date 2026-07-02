// src/lib/serp/evaluateCruiseQueryQuality.ts
// Purpose: Detect weak cruise SERP runs caused by broken quotes, missing package terms, or overly broad results.

export type CruiseQueryQuality = {
  quality: "good" | "mixed" | "poor";
  problems: string[];
  requiredFollowUpQueries: string[];
};

type SerpOrganicResult = {
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
};

type EvaluateCruiseQueryQualityInput = {
  query: string;
  organicResults: SerpOrganicResult[];
  requiredTerms: string[];
};

function countQuotes(value: string): number {
  return (value.match(/"/g) ?? []).length;
}

function resultText(result: SerpOrganicResult): string {
  return [result.title, result.link, result.snippet, result.source]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function evaluateCruiseQueryQuality(
  input: EvaluateCruiseQueryQualityInput,
): CruiseQueryQuality {
  const problems: string[] = [];
  const requiredFollowUpQueries: string[] = [];

  const query = input.query.trim();
  const quoteCount = countQuotes(query);

  if (quoteCount % 2 !== 0) problems.push("BROKEN_QUOTES");

  const allResultText = input.organicResults.map(resultText).join(" ");

  for (const term of input.requiredTerms) {
    if (!allResultText.includes(term.toLowerCase())) {
      problems.push(`MISSING_REQUIRED_RESULT_TERM:${term.toUpperCase().replaceAll(" ", "_")}`);
    }
  }

  const hotelNoise = input.organicResults.filter((result) =>
    resultText(result).includes("hotel"),
  ).length;

  if (hotelNoise >= 2) problems.push("HOTEL_NOISE");

  const socialNoise = input.organicResults.filter((result) => {
    const text = resultText(result);
    return text.includes("facebook.com") || text.includes("tripadvisor.com") || text.includes("tiktok.com");
  }).length;

  if (socialNoise >= 2) problems.push("SOCIAL_OR_FORUM_NOISE");

  if (problems.includes("BROKEN_QUOTES")) {
    requiredFollowUpQueries.push(`"Seattle" cruise "Have It All" suite`);
  }

  if (problems.some((problem) => problem.includes("MISSING_REQUIRED_RESULT_TERM:HAVE_IT_ALL"))) {
    requiredFollowUpQueries.push(`site:hollandamerica.com "Have It All" "Seattle" suite`);
    requiredFollowUpQueries.push(`site:hollandamerica.com "Have It All" "Alaska" suite`);
  }

  return {
    quality: problems.length >= 3 ? "poor" : problems.length >= 1 ? "mixed" : "good",
    problems,
    requiredFollowUpQueries,
  };
}
