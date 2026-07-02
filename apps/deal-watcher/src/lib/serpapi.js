// apps/deal-watcher/src/lib/serpapi.js
// Purpose: Safe SerpApi request builder and response sanitizer.

const SERPAPI_ENDPOINT = 'https://serpapi.com/search.json';

export function getSerpApiKey(env = process.env) {
  return env.SERPAPI_KEY || '';
}

export function buildSerpApiUrl(query, options = {}) {
  const apiKey = options.apiKey || getSerpApiKey();

  if (!apiKey) {
    throw new Error('Missing SERPAPI_KEY. Copy .env.example to .env or export SERPAPI_KEY before scanning.');
  }

  const params = new URLSearchParams({
    engine: 'google',
    q: query,
    hl: options.hl || 'en',
    gl: options.gl || 'us',
    google_domain: options.googleDomain || 'google.com',
    device: options.device || 'desktop',
    api_key: apiKey
  });

  return `${SERPAPI_ENDPOINT}?${params.toString()}`;
}

export async function runSerpApiQuery(query, options = {}) {
  const url = buildSerpApiUrl(query, options);
  const response = await fetch(url, {
    headers: {
      'user-agent': 'travel-deal-watcher/0.1'
    }
  });

  if (!response.ok) {
    throw new Error(`SerpApi request failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return sanitizeSerpApiResponse(json);
}

export function sanitizeSerpApiResponse(json) {
  return {
    search_metadata: {
      status: json.search_metadata?.status,
      created_at: json.search_metadata?.created_at,
      processed_at: json.search_metadata?.processed_at,
      total_time_taken: json.search_metadata?.total_time_taken
    },
    search_parameters: {
      engine: json.search_parameters?.engine,
      q: json.search_parameters?.q,
      hl: json.search_parameters?.hl,
      gl: json.search_parameters?.gl,
      device: json.search_parameters?.device
    },
    search_information: json.search_information || {},
    organic_results: (json.organic_results || []).map(sanitizeOrganicResult),
    related_searches: (json.related_searches || []).map((item) => ({
      query: item.query,
      block_position: item.block_position
    })),
    related_questions: (json.related_questions || []).map((item) => ({
      question: item.question,
      type: item.type
    }))
  };
}

export function sanitizeOrganicResult(result) {
  return {
    position: result.position,
    title: result.title,
    link: result.link,
    displayed_link: result.displayed_link,
    snippet: result.snippet,
    source: result.source,
    date: result.date,
    rich_snippet: result.rich_snippet
  };
}
