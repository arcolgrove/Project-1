import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dedupeAndSort, getNews, isFootballStory, isRelevant, parseFeed } from "@/lib/news";
import type { NewsItem, NewsSource } from "@/lib/types";

const fixture = (name: string) => readFileSync(join(__dirname, "fixtures", name), "utf8");

const googleSource: NewsSource = {
  id: "google-news",
  name: "Google News",
  url: "https://news.google.com/rss",
  type: "media",
  filter: "none",
};
const redditSource: NewsSource = {
  id: "reddit-wde",
  name: "r/wde (Reddit)",
  url: "https://www.reddit.com/r/wde/.rss",
  type: "social",
  filter: "auburn-sports",
};

describe("parseFeed", () => {
  it("splits the outlet from Google News titles and skips undated items", async () => {
    const items = await parseFeed(googleSource, fixture("google-news.xml"));
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      title: "Auburn football lands four-star QB commit",
      source: "AL.com",
      sourceType: "media",
      publishedAt: "2026-10-10T14:00:00.000Z",
    });
    expect(items[0].summary).toBeUndefined();
  });

  it("treats a feed with no entries as a failure", async () => {
    const empty = '<?xml version="1.0"?><rss version="2.0"><channel><title>x</title></channel></rss>';
    await expect(parseFeed(googleSource, empty)).rejects.toThrow("no items");
  });

  it("filters non-football stories from general feeds and reads Atom thumbnails", async () => {
    const items = await parseFeed(redditSource, fixture("reddit.xml"));
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: "Post-game thread: Auburn football wins in overtime",
      link: "https://www.reddit.com/r/wde/comments/1/",
      image: "https://i.redd.it/thumb.jpg",
      summary: "What a game",
    });
  });
});

describe("isFootballStory", () => {
  it("matches whole football terms only", () => {
    expect(isFootballStory("Golesh talks QB battle")).toBe(true);
    expect(isFootballStory("Iron Bowl week")).toBe(true);
    expect(isFootballStory("Auburn baseball sweeps series")).toBe(false);
    expect(isFootballStory("Committee approves budget")).toBe(false);
  });
});

describe("isRelevant", () => {
  const broad: NewsSource = { id: "v", name: "YouTube", url: "https://x", type: "video", filter: "broad" };

  it("requires an Auburn mention for broad feeds", () => {
    expect(isRelevant(broad, "PRESSER: Alex Golesh previews the Georgia game")).toBe(true);
    expect(isRelevant(broad, "Monday LIVE: State of Clemson Football")).toBe(false);
    expect(isRelevant(broad, "SGA Senate Meeting | Auburn University")).toBe(false);
    expect(isRelevant(broad, "Auburn's 3 Keys to Survival vs Georgia Coming Out of the Bye")).toBe(true);
    expect(isRelevant(broad, "Inside Auburn's Georgia Recruiting Push")).toBe(true);
    expect(isRelevant(broad, "The schedule is set! @auburnsoccer is back home vs. Kentucky")).toBe(false);
  });

  it("drops other Auburn sports from all-sports feeds", () => {
    expect(isRelevant(redditSource, "Bowers defends ITA Southern Regional tennis title")).toBe(false);
    expect(isRelevant(redditSource, "Monday thoughts from Auburn football and Auburn basketball")).toBe(true);
  });

  it("requires a football term for strict feeds", () => {
    const official: NewsSource = { ...googleSource, type: "official", filter: "football" };
    expect(isRelevant(official, "Missouri defeats Auburn in comeback fashion")).toBe(false);
    expect(isRelevant(official, "AU FB Game Notes 2026_6 Georgia.pdf")).toBe(true);
  });

  it("skips filtering for Auburn-football-only feeds", () => {
    expect(isRelevant(googleSource, "Tigers prep for road trip")).toBe(true);
  });
});

describe("dedupeAndSort", () => {
  const item = (id: string, title: string, link: string, publishedAt: string): NewsItem => ({
    id,
    title,
    link,
    source: "x",
    sourceType: "media",
    publishedAt,
  });

  it("removes duplicate URLs and headlines, newest first", () => {
    const result = dedupeAndSort([
      item("a", "Story One", "https://www.site.com/one/", "2026-10-01T00:00:00Z"),
      item("b", "Story one!", "https://other.com/1", "2026-10-02T00:00:00Z"),
      item("c", "Story Two", "https://www.site.com/three/?utm=x", "2026-09-30T00:00:00Z"),
      item("d", "Story Three", "https://site.com/three", "2026-10-03T00:00:00Z"),
    ]);
    expect(result.map((r) => r.id)).toEqual(["d", "b"]);
  });
});

describe("getNews", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps working when one source fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.includes("reddit") ? new Response("nope", { status: 503 }) : new Response(fixture("google-news.xml")),
      ),
    );
    const result = await getNews([googleSource, redditSource]);
    expect(result.failedSources).toEqual(["r/wde (Reddit)"]);
    expect(result.items.map((i) => i.title)).toEqual([
      "Tigers prep for road trip",
      "Auburn football lands four-star QB commit",
    ]);
  });
});
