import Parser from "rss-parser";
import { SPORT_IDS, SPORTS, type SportId } from "./sports";
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

/**
 * Signs a story is about another Auburn sport or campus life. Matched as plain
 * substrings so handles like "@auburnsoccer" count too. Sports the site covers
 * add their own markers (see `otherTopics`).
 */
const NON_SITE_TOPICS = [
  "baseball",
  "softball",
  "soccer",
  "volleyball",
  "tennis",
  "golf",
  "gymnastics",
  "swim",
  "track & field",
  "track and field",
  "cross country",
  "equestrian",
  "sga",
  "senate",
];

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function isSportStory(text: string, sport: SportId): boolean {
  const lower = text.toLowerCase();
  return SPORTS[sport].terms.some((term) => new RegExp(`\\b${escapeRegExp(term)}\\b`).test(lower));
}

function otherTopics(sport: SportId): string[] {
  const otherSports = SPORT_IDS.filter((id) => id !== sport).flatMap((id) => SPORTS[id].markers);
  return [...NON_SITE_TOPICS, ...otherSports];
}

function isOtherTopic(text: string, sport: SportId): boolean {
  const lower = text.toLowerCase();
  return otherTopics(sport).some((topic) => lower.includes(topic));
}

/** Applies the source's relevance filter for a sport; see `NewsSource.filter`. */
export function isRelevant(source: NewsSource, text: string, sport: SportId): boolean {
  switch (source.filter) {
    case "none":
      return true;
    case "sport":
      return isSportStory(text, sport);
    case "broad":
      if (!SPORTS[sport].auburnPattern.test(text)) return false;
    // falls through
    case "auburn-sports":
      // Many headlines never name the sport (e.g. "Auburn's 3 keys vs Georgia").
      return isSportStory(text, sport) || !isOtherTopic(text, sport);
  }
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

export function normalizeFeedItems(source: NewsSource, items: FeedItem[], sport: SportId): NewsItem[] {
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
      // Official results are all from AuburnTigers.com; keep that name over Google's outlet label.
      if (source.type !== "official") sourceName = split.outlet ?? source.name;
    }
    // Social posts arrive with the whole caption as the title.
    title = truncate(title, 200);

    const rawSummary =
      item.contentSnippet ?? item["media:group"]?.["media:description"]?.[0] ?? item.content ?? "";
    let summary = truncate(stripHtml(rawSummary));
    // Google News snippets just repeat the headline and outlet.
    if (isGoogleNews(source) || summary.startsWith(title)) summary = "";

    if (/^download pdf$/i.test(title) || !isRelevant(source, `${title} ${summary}`, sport)) continue;

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

export async function parseFeed(source: NewsSource, xml: string, sport: SportId): Promise<NewsItem[]> {
  const feed = await parser.parseString(xml);
  // A feed with no entries at all is almost always a block page or a moved URL.
  if (feed.items.length === 0) throw new Error(`${source.id}: feed has no items`);
  return normalizeFeedItems(source, feed.items, sport);
}

async function fetchSource(source: NewsSource, sport: SportId): Promise<NewsItem[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "AuburnSportsHub/1.0 (+news aggregator)" },
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    next: { revalidate: NEWS_REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`${source.id}: HTTP ${res.status}`);
  return parseFeed(source, await res.text(), sport);
}

export async function getNews(sport: SportId, sources: NewsSource[] = SPORTS[sport].sources): Promise<NewsResult> {
  const results = await Promise.allSettled(sources.map((source) => fetchSource(source, sport)));
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
