import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dedupeAndSort, getNews, isFootballStory, parseFeed } from "@/lib/news";
import type { NewsItem, NewsSource } from "@/lib/types";

const fixture = (name: string) => readFileSync(join(__dirname, "fixtures", name), "utf8");

const googleSource: NewsSource = {
  id: "google-news",
  name: "Google News",
  url: "https://news.google.com/rss",
  type: "media",
  auburnOnly: true,
};
const redditSource: NewsSource = {
  id: "reddit-wde",
  name: "r/wde (Reddit)",
  url: "https://www.reddit.com/r/wde/.rss",
  type: "social",
  auburnOnly: false,
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
    expect(isFootballStory("Freeman talks QB battle")).toBe(true);
    expect(isFootballStory("Iron Bowl week")).toBe(true);
    expect(isFootballStory("Auburn baseball sweeps series")).toBe(false);
    expect(isFootballStory("Committee approves budget")).toBe(false);
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
