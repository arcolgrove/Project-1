# Auburn Football Hub

A web app (installable on phones as a PWA) that pulls the latest Auburn Tigers football news from across the web into one feed, along with the team roster and schedule.

## Features
- **News feed** (`/`): aggregates free RSS/Atom feeds from media outlets, the official athletics site, Reddit, and YouTube. Stories are filtered for football relevance, de-duplicated, sorted newest first, and refreshed every 10 minutes. Filter by source type (Media / Official / Social / Video) or search headlines. Every headline links to the original publisher.
- **Schedule** (`/schedule`): full season with next-game card, results, record, TV, and venue.
- **Roster** (`/roster`): searchable roster filterable by offense / defense / special teams.
- **JSON API** (`/api/news`): the aggregated feed, for future mobile clients.

Roster and schedule come from ESPN's public site API (team id `2`). If ESPN can't be reached, the pages show clearly labeled placeholder sample data from `data/`.

## Getting started
```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (vitest)
npm run lint
npm run build && npm start
```

## Adding or changing news sources
Edit `lib/sources.ts`. Each source has a `type` (`media`, `official`, `social`, `video`) and an `auburnOnly` flag: feeds that cover only Auburn football skip the keyword filter; broader feeds (e.g. all Auburn sports) are filtered with the football terms in `lib/news.ts`.

## Project layout
```
app/            pages (news, schedule, roster), API route, PWA manifest
components/     NewsFeed, RosterTable, Notice
lib/            news aggregation, ESPN client, sources, formatting, types
data/           placeholder fallback roster/schedule
tests/          vitest unit tests + feed fixtures
```

## Ideas for later
X/Twitter or NewsAPI integration (requires paid API keys), push notifications for breaking news, live game-day scores, and a native mobile app using `/api/news`.

_Independent fan project, not affiliated with Auburn University._
