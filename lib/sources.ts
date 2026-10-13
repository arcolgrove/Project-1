import type { NewsSource } from "./types";

/** Google News RSS search; reliably reachable from cloud hosts that some sites block. */
const googleNews = (query: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:7d`)}&hl=en-US&gl=US&ceid=US:en`;

/**
 * News feeds aggregated on the home page. Add, remove, or edit entries here.
 * All are free RSS/Atom feeds that need no API key. Site-specific Google News
 * queries come first so their source type wins when the general query returns
 * the same story.
 */
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "google-official",
    name: "AuburnTigers.com",
    url: googleNews("football site:auburntigers.com"),
    type: "official",
    auburnOnly: true,
  },
  {
    id: "google-video",
    name: "YouTube",
    url: googleNews('"Auburn football" site:youtube.com'),
    type: "video",
    auburnOnly: true,
  },
  {
    id: "google-social",
    name: "Social",
    url: googleNews('"Auburn football" (site:x.com OR site:reddit.com OR site:instagram.com OR site:tiktok.com)'),
    type: "social",
    auburnOnly: true,
  },
  {
    id: "google-news",
    name: "Google News",
    url: googleNews('"Auburn football"'),
    type: "media",
    auburnOnly: true,
  },
  {
    id: "auburntigers",
    name: "AuburnTigers.com",
    url: "https://auburntigers.com/rss.aspx?path=football",
    type: "official",
    auburnOnly: true,
  },
  {
    id: "al-com",
    name: "AL.com",
    url: "https://www.al.com/arc/outboundfeeds/rss/category/auburn-football/?outputType=xml",
    type: "media",
    auburnOnly: true,
  },
  {
    id: "plainsman",
    name: "The Auburn Plainsman",
    url: "https://www.theplainsman.com/plugin/feeds/section/sports",
    type: "media",
    auburnOnly: false,
  },
  {
    id: "college-and-magnolia",
    name: "College & Magnolia",
    url: "https://www.collegeandmagnolia.com/rss/current.xml",
    type: "media",
    auburnOnly: false,
  },
  {
    id: "reddit-wde",
    name: "r/wde (Reddit)",
    url: "https://www.reddit.com/r/wde/.rss",
    type: "social",
    auburnOnly: false,
  },
  {
    id: "youtube-auburn",
    name: "Auburn Tigers (YouTube)",
    url: "https://www.youtube.com/feeds/videos.xml?user=AuburnTigers",
    type: "video",
    auburnOnly: false,
  },
];
