// apps/deal-watcher/src/lib/classify.js
// Purpose: Unified result classifier for travel deals, cruise bundles, mistake fares, and last-minute ticket sources.

const SOCIAL_DOMAINS = ['reddit.com', 'facebook.com', 'instagram.com', 'tiktok.com', 'x.com', 'quora.com'];
const REVIEW_DOMAINS = ['trustpilot.com', 'consumeraffairs.com', 'bbb.org'];
const OFFICIAL_GOING_DOMAINS = ['going.com'];

const CRUISE_TERMS = ['cruise', 'stateroom', 'sailing', 'ship', 'balcony', 'suite', 'veranda'];
const SEATTLE_TERMS = ['seattle', 'sea-tac', 'port of seattle'];
const CABIN_BALCONY_TERMS = ['balcony', 'veranda', 'balcony stateroom', 'veranda stateroom'];
const CABIN_SUITE_TERMS = ['suite', 'mini-suite', 'club suite', 'haven', 'retreat suite', 'neptune suite', 'signature suite'];
const INCLUSION_TERMS = ['all inclusive', 'all-inclusive', 'all included', 'free at sea', 'princess plus', 'princess premier', 'have it all', 'drink package', 'beverage package', 'wifi', 'wi-fi', 'tips included', 'gratuities included', 'onboard credit', 'shore excursion credit'];
const KIDS_TERMS = ['kids sail free', 'kids free', '3rd guest', '4th guest', '5th guest', 'children sail free'];
const MISTAKE_FARE_TERMS = ['mistake fare', 'mistake fares', 'error fare', 'error fares', 'glitch fare', 'glitch fares'];
const CURRENT_TERMS = ['today', 'current', 'live', 'right now', 'alert', 'alerts', 'price drop', 'price drops'];
const TICKET_TERMS = ['last minute tickets', 'last-minute tickets', 'same-day tickets', 'resale tickets', 'verified tickets', 'below face value'];
const PACKAGE_TERMS = ['vacation package', 'flight and hotel', 'hotel and flight', 'all-inclusive resort', 'room upgrade', 'free breakfast', 'promo code', 'spa credit', 'bundle'];
const RISK_TERMS = ['taxes', 'port fees', 'gratuities', 'service charge', 'terms apply', 'not included', 'may not qualify', 'limited time', 'canceled', 'cancelled', 'nonrefundable'];

export function classifyResult(result, watchlist) {
  const text = normalizeText(result);
  const badges = [];
  const riskFlags = [];
  const rejectFlags = [];
  let score = 0;
  let kind = 'unknown';

  if (includesAny(text, SOCIAL_DOMAINS)) {
    badges.push('SOCIAL_SIGNAL');
    riskFlags.push('SOCIAL_SOURCE_UNVERIFIED');
    rejectFlags.push('SOCIAL_ONLY');
    score -= 20;
  }

  if (includesAny(text, REVIEW_DOMAINS)) {
    badges.push('REVIEW_CONTEXT');
    rejectFlags.push('REVIEW_ONLY');
    score -= 15;
  }

  if (includesAny(text, SEATTLE_TERMS)) {
    badges.push('SEATTLE_MATCH');
    score += 15;
  }

  if (includesAny(text, CABIN_SUITE_TERMS)) {
    badges.push('SUITE_PREFERRED', 'BALCONY_OR_BETTER');
    score += 25;
  } else if (includesAny(text, CABIN_BALCONY_TERMS)) {
    badges.push('BALCONY_OR_BETTER');
    score += 18;
  }

  if (includesAny(text, INCLUSION_TERMS)) {
    badges.push('BUNDLED_INCLUSIONS');
    score += 22;
  }

  if (includesAny(text, KIDS_TERMS)) {
    badges.push('KIDS_FREE_CLAIM');
    score += 18;
  }

  if (includesAny(text, PACKAGE_TERMS)) {
    badges.push('PACKAGE_OR_BUNDLE');
    score += 16;
  }

  if (includesAny(text, MISTAKE_FARE_TERMS)) {
    badges.push('MISTAKE_OR_ERROR_FARE');
    riskFlags.push('MISTAKE_FARE_CAN_BE_CANCELED', 'PRICE_MAY_DISAPPEAR_FAST', 'CHECK_DIRECT_BOOKING_TOTAL');
    score += 28;
  }

  if (includesAny(text, CURRENT_TERMS)) {
    badges.push('CURRENT_SIGNAL');
    score += 15;
  }

  if (includesAny(text, OFFICIAL_GOING_DOMAINS)) {
    badges.push('OFFICIAL_SOURCE');
    score += 18;
  }

  if (includesAny(text, TICKET_TERMS)) {
    badges.push('LAST_MINUTE');
    score += 18;
  }

  if (text.includes('verified')) {
    badges.push('VERIFIED_RESALE');
    score += 8;
  }

  if (text.includes('discount') || text.includes('save') || text.includes('% off')) {
    badges.push('DISCOUNT_LANGUAGE');
    score += 8;
  }

  const price = detectPrice(result);
  if (typeof price === 'number') {
    badges.push('PRICE_DETECTED');
    score += 10;
  }

  for (const term of RISK_TERMS) {
    if (text.includes(term)) {
      riskFlags.push(`RISK:${term.toUpperCase().replaceAll(' ', '_')}`);
    }
  }

  if (watchlist.vertical === 'cruise') {
    kind = includesAny(text, CRUISE_TERMS) ? 'cruise_candidate' : 'cruise_context';
  } else if (watchlist.vertical === 'mistake_fare') {
    if (badges.includes('MISTAKE_OR_ERROR_FARE') && badges.includes('CURRENT_SIGNAL')) {
      kind = 'possible_live_mistake_fare';
    } else if (badges.includes('OFFICIAL_SOURCE')) {
      kind = 'official_mistake_fare_source';
    } else {
      kind = 'mistake_fare_context';
    }
  } else if (watchlist.vertical === 'tickets') {
    kind = badges.includes('LAST_MINUTE') ? 'last_minute_ticket_candidate' : 'ticket_context';
  } else if (watchlist.vertical === 'all_inclusive') {
    kind = badges.includes('PACKAGE_OR_BUNDLE') || badges.includes('BUNDLED_INCLUSIONS') ? 'package_candidate' : 'package_context';
  }

  const requiredMatches = watchlist.requiredBadges.filter((badge) => badges.includes(badge));
  const preferredMatches = watchlist.preferredBadges.filter((badge) => badges.includes(badge));

  score += requiredMatches.length * 12;
  score += preferredMatches.length * 8;

  const qualifies = requiredMatches.length === watchlist.requiredBadges.length && !rejectFlags.includes('REVIEW_ONLY');

  return {
    id: createStableId(result.link || `${watchlist.id}:${result.position}:${result.title}`),
    watchlistId: watchlist.id,
    vertical: watchlist.vertical,
    kind,
    title: result.title || 'Untitled result',
    link: result.link || '',
    displayedLink: result.displayed_link || '',
    snippet: result.snippet || '',
    source: result.source || '',
    date: result.date || '',
    price,
    score: Math.max(0, score),
    confidence: score >= 85 ? 'high' : score >= 55 ? 'medium' : 'low',
    qualifies,
    badges: unique(badges),
    riskFlags: unique(riskFlags),
    rejectFlags: unique(rejectFlags),
    requiredMatches,
    preferredMatches,
    nextAction: getNextAction({ qualifies, kind, riskFlags, rejectFlags })
  };
}

export function normalizeText(result) {
  return [result.title, result.link, result.displayed_link, result.snippet, result.source, result.date]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

export function detectPrice(result) {
  const topPrice = result.rich_snippet?.top?.detected_extensions?.price;
  const bottomPrice = result.rich_snippet?.bottom?.detected_extensions?.price;

  if (typeof topPrice === 'number') return topPrice;
  if (typeof bottomPrice === 'number') return bottomPrice;

  const text = normalizeText(result);
  const match = text.match(/\$\s?(\d{2,6})(?:[,.](\d{3}))?/);
  if (!match) return undefined;

  const normalized = match[2] ? `${match[1]}${match[2]}` : match[1];
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function unique(values) {
  return [...new Set(values)];
}

export function createStableId(input) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getNextAction({ qualifies, kind, riskFlags, rejectFlags }) {
  if (rejectFlags.includes('SOCIAL_ONLY')) {
    return 'Keep as context only. Require a verified booking or official source before alerting.';
  }

  if (kind === 'possible_live_mistake_fare') {
    return 'Verify immediately on airline or booking-provider checkout before booking any connected hotel or nonrefundable travel.';
  }

  if (qualifies && riskFlags.length > 0) {
    return 'Open the provider page and verify final total, taxes, service charges, and eligibility terms.';
  }

  if (qualifies) {
    return 'Candidate is worth checking manually for final price and dates.';
  }

  return 'Store as research/context. Do not alert yet.';
}
