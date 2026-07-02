# All-Inclusive Trip Watcher: SerpApi Search Rules

## What this SERP was

Query tested:

```txt
All inclusive trips huge discount
```

This is useful as a **source-discovery query**. It found major all-inclusive travel sources, but it is too broad for final price monitoring.

## Strong source candidates from the SERP

The useful booking or deal-source candidates are:

| Source | Why it matters | Watcher use |
|---|---|---|
| All Inclusive Outlet | Large all-inclusive marketplace with discount language | Primary deal source |
| Apple Vacations | All-inclusive vacation deals with meals, drinks, and activities language | Primary deal source |
| CheapCaribbean | All-inclusive resort package and tropical deal language | Primary deal source |
| Club Med | Direct all-inclusive resort operator with percent-off promos | Primary deal source |
| Travelzoo | Deal collection with specific savings claims | Deal discovery source |
| Funjet Vacations | Package seller with flights + resort + one-price language | Primary deal source |
| Tripadvisor | Review/comparison result | Reputation check only |
| Reddit/Facebook | User-source discussion | Warning/reputation signal only |
| YouTube | Research content | Not a booking source |

## Why the query is not enough

Problems:

- No departure airport
- No destination
- No dates
- No traveler count
- No child pricing requirement
- No budget ceiling
- No clear airfare requirement
- Most results are landing pages, not live package prices

The app should score it as:

```txt
purpose: source_discovery
quality: mixed
```

## Better follow-up queries

For Brooke's current family-search target:

```txt
all inclusive vacation packages from SEA for 2 adults 1 child
all inclusive resort packages with airfare from SEA under $10000
Cancun all inclusive package from SEA family under $10000
Punta Cana all inclusive package from SEA family under $10000
Riviera Maya all inclusive package from SEA family under $10000
Jamaica all inclusive package from SEA family under $10000
site:allinclusiveoutlet.com family all inclusive from SEA
site:cheapcaribbean.com all inclusive package from SEA
site:applevacations.com all inclusive deals from SEA
site:funjet.com all inclusive vacation packages from SEA
site:travelzoo.com all-inclusive Cancun save family
```

## Required fields before a deal can be trusted

A result should not be marked as a verified deal unless the app can capture:

```txt
source
package URL
destination
resort name
origin airport
travel dates
nights
traveler count
room type
meal/drink inclusion
airport transfer inclusion
base package price
taxes and fees
resort fees
baggage fees if airfare is included
final estimated total
cancellation policy
last checked timestamp
```

## Watcher labels

Good labels:

```txt
PRIMARY_DEAL_SOURCE
ALL_INCLUSIVE_PACKAGE_SIGNAL
WARM_DESTINATION_SIGNAL
AIRFARE_SIGNAL
FAMILY_SIGNAL
LAST_MINUTE_SIGNAL
PERCENT_DISCOUNT
DOLLAR_SAVINGS
FINAL_PRICE_DETECTED
UNDER_BUDGET
```

Risk labels:

```txt
FINAL_PRICE_UNKNOWN
AIRFARE_NOT_CONFIRMED
CHILD_PRICE_NOT_CONFIRMED
RESORT_FEES_UNKNOWN
TRANSFER_NOT_CONFIRMED
UNVERIFIED_SOCIAL_SOURCE
VIDEO_NOT_BOOKING_SOURCE
REVIEW_SOURCE_NOT_BOOKING_SOURCE
```

## Privacy and safety

Do not commit:

- SerpApi API keys
- Raw SerpApi `json_endpoint` values
- Raw SerpApi `raw_html_file` values
- Search IDs
- Passenger names
- Passport information
- Payment details
- Private booking confirmation numbers
