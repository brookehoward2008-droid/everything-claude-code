# Cruise Deal Watcher: SerpApi Search Rules

## Target

Build a watcher for cruise deals using SerpApi search results. The current target is:

- Departure or return focus: Seattle
- Travelers: 2 adults + 1 child
- Cabin: balcony minimum, suite preferred
- Package: all-inclusive style or bundled inclusions required
- Budget signal: around $10,000 or less after taxes, port fees, gratuities, and package costs
- Promo signals: kids sail free, Free at Sea, Princess Plus/Premier, Celebrity All Included, Holland America Have It All

## Query rules

Run focused queries one at a time. Do not combine multiple intent phrases into one long Google query.

Good examples:

```txt
"Seattle" cruise "Free at Sea" balcony
"Seattle" cruise "Free at Sea" suite
"Seattle" cruise "Princess Plus" balcony
"Seattle" cruise "Princess Premier" suite
"Seattle" cruise "Celebrity All Included" suite
"Seattle" cruise "Have It All" suite
"Seattle" "Have It All" suite price
"AlaskaCruises.com" "Noordam" "May 16, 2027" suite
"AlaskaCruises.com" "Noordam" "May 16, 2027" balcony
```

Bad examples:

```txt
Travel
"Seattle" cruise "Free at Sea" balcony "Seattle" cruise "Free at Sea" suite "Seattle" cruise "Princess Plus" balcon
Seattle" cruise "Have It All" suite
```

Problems caught by the app:

- Too broad
- Multiple intents combined
- Broken quotation marks
- Missing required package terms in organic results
- Social/forum noise
- Hotel/pre-cruise package noise

## Candidate labels

Top deal candidates should have:

```txt
BALCONY_OR_BETTER
BUNDLED_INCLUSIONS
SEATTLE_ROUNDTRIP or SEATTLE_DEPARTURE
SPECIFIC_SAILING_DATE when possible
SHIP_IDENTIFIED when possible
```

Suite results outrank balcony results, but balcony results can still qualify if the bundled package is strong.

## Important risk flags

```txt
SUITE_PRICE_NOT_CONFIRMED
CHILD_PRICE_NOT_CONFIRMED
ALL_GUESTS_MUST_BOOK_PACKAGE_FARE
ALASKA_NOT_WARM_DESTINATION
FINAL_TOTAL_UNKNOWN
TAXES_PORT_FEES_UNKNOWN
EXTRA_FEES_POSSIBLE
SOCIAL_OR_FORUM_NOISE
STALE_DATE_RISK
```

## Strong finding from current research

The strongest Holland America / Have It All candidate found so far:

```txt
Source: AlaskaCruises.com
Sailing: 7 Night Alaska Explorer Cruise
Ship: Noordam
Date: May 16, 2027
Route: Seattle to Seattle
Package signal: Have It All
Included signals: shore excursion credit, drinks, dining
Status: possible candidate, but final suite/balcony pricing is not confirmed
Destination: Alaska, so not a warm-destination match
```

## Privacy and safety

Do not commit:

- SerpApi API keys
- Raw SerpApi `json_endpoint` URLs
- Raw SerpApi `raw_html_file` URLs
- Search IDs
- Personal booking information
- Full passenger names or payment details

Use `.env.local` for local secrets:

```bash
SERPAPI_KEY=your_private_key_here
```
