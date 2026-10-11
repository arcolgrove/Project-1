import type { NewsSource } from "./types";

/**
 * News feeds aggregated on the home page. Add, remove, or edit entries here.
 * All are free RSS/Atom feeds that need no API key.
 */
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "google-news",
    name: "Google News",
    url: "https://news.google.com/rss/search?q=%22Auburn+football%22+when:7d&hl=en-US&gl=US&ceid=US:en",
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
