# Mistake Fare Agent Strategy

This document defines the first mistake-fare agent layer for the travel deal watcher.

## Target

Find Going.com-style mistake fares, error fares, glitch fares, ultra-low fares, and major flight price drops.

The agent layer must keep these categories separate:

1. Current or potentially live deal leads
2. Official Going.com source pages
3. Mistake-fare education pages
4. Airline honor/cancellation policy pages
5. Third-party analysis
6. Social proof
7. Reviews and complaints
8. Noise

## Source interpretation from the supplied SerpApi result

The query `Going.com mistake current list` returned several useful classes of results:

| Source | Classification | Use |
|---|---|---|
| Going homepage | official source | Confirms Going monitors price drops and mistake fares |
| Going mistake-fare guides | education / rules source | Explains mistake fares, error fares, glitch fares, ticketing errors, and booking caution |
| Going flights page | official source | Confirms Going positioning around ultra-low and mistake/error fares |
| Forbes mistake-airfare article | third-party safety source | Adds cancellation-risk and wait-before-booking context |
| Reddit threads | social proof only | Useful for user experience and complaints, not live fare verification |
| Facebook post | social proof only | Useful as a weak signal, not a booking source |
| Trustpilot | reputation context | Useful for confidence scoring, not a deal source |
| Worst-airline related questions | noise | Reject from deal alerts |

## Alert rule

A result should become an alert candidate only when it has:

- mistake/error/glitch fare language
- current/live/today/alert language
- a source that can lead to booking or direct fare verification
- no stale historical-only marker

Social posts, reviews, and guide pages should never produce a booking alert by themselves.

## Safety rule

Mistake fares can disappear quickly and may be canceled. The watcher should label them with:

- `MISTAKE_FARE_CAN_BE_CANCELED`
- `PRICE_MAY_DISAPPEAR_FAST`
- `WAIT_BEFORE_NONREFUNDABLE_PLANS`
- `AIRLINE_MAY_NOT_HONOR`
- `CHECK_DIRECT_BOOKING_TOTAL`

## Priority queries

Run these first:

```txt
mistake fares today
current mistake fares
error fare today flight deal
site:going.com mistake fares current
site:going.com flight alerts mistake fares
```

Then run rule/safety queries:

```txt
Going.com mistake fare ticketing error currency mismatch
Forbes mistake airfares Going.com canceled percentage
do airlines have to honor mistake fares
```

Then run social/reputation queries:

```txt
Going.com mistake fare booked reddit
Going.com reviews complaints
```

## Dashboard labels

Use the following labels in the UI:

- `Possible Live Mistake Fare`
- `Official Going Source`
- `Mistake Fare Guide`
- `Airline Honor Risk`
- `Social Proof Only`
- `Review Context Only`
- `Historical Deal Only`
- `Rejected Noise`

## Important boundaries

Do not store SerpApi raw HTML URLs, JSON endpoint IDs, search IDs, API keys, passenger payment data, or booking credentials.

Do not present a mistake-fare lead as confirmed until the fare is verified on the airline or booking provider final checkout page.
