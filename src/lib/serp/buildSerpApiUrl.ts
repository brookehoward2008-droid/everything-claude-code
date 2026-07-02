// src/lib/serp/buildSerpApiUrl.ts
// Purpose: Build safe SerpApi URLs from controlled search parameters.

export type SerpApiDevice = "desktop" | "mobile" | "tablet";

export type BuildSerpApiUrlOptions = {
  query: string;
  device?: SerpApiDevice;
  start?: number;
};

export function buildSerpApiUrl(options: BuildSerpApiUrlOptions): string {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    throw new Error("Missing SERPAPI_KEY environment variable.");
  }

  const params = new URLSearchParams({
    engine: "google",
    q: options.query,
    hl: "en",
    gl: "us",
    google_domain: "google.com",
    device: options.device ?? "desktop",
    api_key: apiKey,
  });

  if (typeof options.start === "number" && options.start > 0) {
    params.set("start", String(options.start));
  }

  return `https://serpapi.com/search.json?${params.toString()}`;
}
