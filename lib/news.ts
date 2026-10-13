import Parser from "rss-parser";
import { NEWS_SOURCES } from "./sources";
import type { NewsItem, NewsResult, NewsSource } from "./types";

const FEED_TIMEOUT_MS = 8000;
export const NEWS_REVALIDATE_SECONDS = 600;

type FeedItem = Parser.Item & {
  id?: string;
  enclosure?: { url?: string; type?: string };
  "media:content"?: { $?: { url?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
  "media:group"?: {
    "media:thumbnail"?: { $?: { url?: string } }[];
    "media:description"?: string[];
  };
  author?: string;
};

const parser: Parser<Record<string, unknown>, FeedItem> = new Parser({
  customFields: {
    item: ["media:content", "media:thumbnail", "media:group", "author"],
  },
});

/** Terms that mark a story from a general Auburn feed as being about football. */
const FOOTBALL_TERMS = [
  "football",
  "quarterback",
  "qb",
  "touchdown",
  "recruit",
  "commit",
  "transfer portal",
  "freeman",
  "iron bowl",
  "game thread",
  "postgame",
  "jordan-hare",
  "bowl game",
  "depth chart",
  "kickoff",
  "wide receiver",
  "linebacker",
  "defensive coordinator",
  "offensive coordinator",
  "sec championship",
  "college football playoff",
];

export function isFootballStory(text: string): boolean {
  const lower = text.toLowerCase();
  return FOOTBALL_TERMS.some((term) =>
    new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower),
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max = 220): string {
  return text.length <= max ? text : `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

function findImage(item: FeedItem): string | undefined {
  if (item.enclosure?.url && (item.enclosure.type ?? "image").startsWith("image")) {
    return item.enclosure.url;
  }
  const fromMedia =
    item["media:content"]?.$?.url ??
    item["media:thumbnail"]?.$?.url ??
    item["media:group"]?.["media:thumbnail"]?.[0]?.$?.url;
  if (fromMedia) return fromMedia;
  const html = item.content ?? "";
  return html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
}

/** Google News titles end with " - Outlet Name"; surface the outlet as the source. */
function splitGoogleTitle(title: string): { title: string; outlet?: string } {
  const idx = title.lastIndexOf(" - ");
  if (idx <= 0) return { title };
  return { title: title.slice(0, idx), outlet: title.slice(idx + 3) };
}

function isGoogleNews(source: NewsSource): boolean {
  return source.url.startsWith("https://news.google.com/");
}

export function normalizeFeedItems(source: NewsSource, items: FeedItem[]): NewsItem[] {
  const out: NewsItem[] = [];
  for (const item of items) {
    if (!item.title || !item.link) continue;
    const date = new Date(item.isoDate ?? item.pubDate ?? "");
    if (Number.isNaN(date.getTime())) continue;

    let title = stripHtml(item.title);
    let sourceName = source.name;
    if (isGoogleNews(source)) {
      const split = splitGoogleTitle(title);
      title = split.title;
      sourceName = split.outlet ?? source.name;
    }

    const rawSummary =
      item.contentSnippet ?? item["media:group"]?.["media:description"]?.[0] ?? item.content ?? "";
    let summary = truncate(stripHtml(rawSummary));
    // Google News snippets just repeat the headline and outlet.
    if (isGoogleNews(source) || summary.startsWith(title)) summary = "";

    if (!source.auburnOnly && !isFootballStory(`${title} ${summary}`)) continue;

    out.push({
      id: `${source.id}:${item.guid ?? item.id ?? item.link}`,
      title,
      link: item.link,
      source: sourceName,
      sourceType: source.type,
      publishedAt: date.toISOString(),
      summary: summary || undefined,
      image: findImage(item),
    });
  }
  return out;
}

function canonicalUrl(link: string): string {
  try {
    const u = new URL(link);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    return link;
  }
}

function titleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Drop duplicates (same URL or same headline), keep newest first. */
export function dedupeAndSort(items: NewsItem[]): NewsItem[] {
  const sorted = [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  return sorted.filter((item) => {
    const url = canonicalUrl(item.link);
    const key = titleKey(item.title);
    if (seenUrls.has(url) || seenTitles.has(key)) return false;
    seenUrls.add(url);
    seenTitles.add(key);
    return true;
  });
}

export async function parseFeed(source: NewsSource, xml: string): Promise<NewsItem[]> {
  const feed = await parser.parseString(xml);
  // A feed with no entries at all is almost always a block page or a moved URL.
  if (feed.items.length === 0) throw new Error(`${source.id}: feed has no items`);
  return normalizeFeedItems(source, feed.items);
}

async function fetchSource(source: NewsSource): Promise<NewsItem[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "AuburnFootballHub/1.0 (+news aggregator)" },
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    next: { revalidate: NEWS_REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`${source.id}: HTTP ${res.status}`);
  return parseFeed(source, await res.text());
}

export async function getNews(sources: NewsSource[] = NEWS_SOURCES): Promise<NewsResult> {
  const results = await Promise.allSettled(sources.map(fetchSource));
  const items: NewsItem[] = [];
  const failedSources: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") items.push(...r.value);
    else {
      failedSources.push(sources[i].name);
      console.warn(`[news] ${sources[i].id} failed:`, r.reason);
    }
  });
  return {
    items: dedupeAndSort(items).slice(0, 150),
    failedSources,
    fetchedAt: new Date().toISOString(),
  };
}
