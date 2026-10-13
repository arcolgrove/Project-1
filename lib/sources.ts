import type { NewsSource } from "./types";

/** Google News RSS search; reliably reachable from cloud hosts that some sites block. */
const googleNews = (query: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:7d`)}&hl=en-US&gl=US&ceid=US:en`;

/**
 * News feeds aggregated on the home page. Add, remove, or edit entries here.
 * All are free RSS/Atom feeds that need no API key. Site-specific Google News
 * queries come first so their source type wins when the general query returns
 * the same story.
 *
 * Direct feeds from AuburnTigers.com, AL.com, The Plainsman, College & Magnolia
 * and YouTube fail or come back empty from Vercel, so those outlets are reached
 * through Google News instead.
 */
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "google-official",
    name: "AuburnTigers.com",
    url: googleNews("football site:auburntigers.com"),
    type: "official",
    filter: "football",
  },
  {
    id: "google-video",
    name: "YouTube",
    url: googleNews('"Auburn football" site:youtube.com'),
    type: "video",
    filter: "broad",
  },
  {
    id: "google-social",
    name: "Social",
    url: googleNews('"Auburn football" (site:x.com OR site:reddit.com OR site:instagram.com OR site:tiktok.com)'),
    type: "social",
    filter: "broad",
  },
  {
    id: "google-news",
    name: "Google News",
    url: googleNews('"Auburn football"'),
    type: "media",
    filter: "none",
  },
  {
    id: "reddit-wde",
    name: "r/wde (Reddit)",
    url: "https://www.reddit.com/r/wde/.rss",
    type: "social",
    filter: "auburn-sports",
  },
];
