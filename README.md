# Auburn Sports Hub

A web app (installable on phones as a PWA) that pulls the latest Auburn Tigers **football** and **men's basketball** news from across the web, along with each team's roster and schedule. A switch in the header moves between the sports and keeps you on the same tab.

## Features
Each sport has the same three pages, under `/football/...` and `/basketball/...` (`/` goes to football):
- **News** (`/[sport]`): aggregates free RSS/Atom feeds from media outlets, the official athletics site, Reddit, and YouTube.
  - Stories are filtered for relevance to that sport, de-duplicated, sorted newest first, and refreshed every 10 minutes.
  - Filter by source type (Media / Official / Social / Video) or search headlines.
  - Every headline links to the original publisher.
- **Schedule** (`/[sport]/schedule`): full season with next-game card, results, record, TV, and venue.
- **Roster** (`/[sport]/roster`): searchable roster, filterable by Offense / Defense / Special Teams or Guards / Forwards / Centers.
- **JSON API** (`/api/[sport]/news`): the aggregated feed, for future mobile clients. `/api/news` is the football feed.

Rosters and schedules come from ESPN's public site API (team id `2` for every sport). If ESPN can't be reached, the pages show clearly labeled placeholder sample data from `data/`.

## Getting started
```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (vitest)
npm run lint
npm run build && npm start
```

## Sports and news sources
Everything that differs between sports lives in `lib/sports.ts`:
- name;
- ESPN path;
- news sources;
- keyword `terms` and `markers`;
- roster groups.

Each source has a `type` (`media`, `official`, `social`, `video`) and a `filter` (documented on `NewsSource` in `lib/types.ts`) that controls how strictly items are checked for being about that sport. To add a sport, add an entry there, add sample data in `data/`, and add it to the `SPORTS` list in `public/sw.js`. Outlets whose own feeds fail from Vercel are reached through site-scoped Google News searches.

## Offline and install
`public/sw.js` is a small service worker, registered in production builds only (`components/RegisterServiceWorker.tsx`).
- **Pages:** fetched from the network first. When offline, the last saved copy is shown, or `/offline` for a page that was never opened.
- **Build assets:** served from the cache.

Together with `app/manifest.ts`, this makes the site installable ("Install app" in Chrome, "Add to Home Screen" in Safari). When you change the worker's caching, bump `CACHE_VERSION` in `sw.js` so old caches are cleared.

## Project layout
```
app/[sport]/    pages (news, schedule, roster) for each sport
app/            layout, offline page, API routes, PWA manifest
components/     SiteHeader (sport switch), NewsFeed, RosterTable, Notice
lib/            sport config, news aggregation, ESPN client, formatting, types
data/           placeholder fallback roster/schedule per sport
tests/          vitest unit tests + feed fixtures
```

## Ideas for later
X/Twitter or NewsAPI integration (requires paid API keys), push notifications for breaking news, live game-day scores, and a native mobile app using `/api/news`.

_Independent fan project, not affiliated with Auburn University._
