import type { NewsSource } from "./types";

export const SPORT_IDS = ["football", "basketball"] as const;
export type SportId = (typeof SPORT_IDS)[number];

export interface SportConfig {
  id: SportId;
  /** Shown in headings, e.g. "Latest Auburn Football News". */
  name: string;
  /** Short label for the sport switch. */
  shortName: string;
  /** ESPN site API path segment; Auburn's team id is the same for every sport. */
  espnPath: string;
  sources: NewsSource[];
  /** Words that mark a story as being about this sport (whole-word match). */
  terms: string[];
  /**
   * Substrings that clearly mark a story as this sport. Stories with another
   * sport's markers are dropped from all-sports feeds.
   */
  markers: string[];
  /** Mentions that tie a broad search result to Auburn. */
  auburnPattern: RegExp;
  /** Roster filter chips, in display order. */
  positionGroups: string[];
  /** Maps an ESPN position abbreviation (and football's unit key) to a roster group. */
  groupOf: (position: string, espnGroup?: string) => string;
}

/** Google News RSS search; reliably reachable from cloud hosts that some sites block. */
const googleNews = (query: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:7d`)}&hl=en-US&gl=US&ceid=US:en`;

const SOCIAL_SITES = "(site:x.com OR site:reddit.com OR site:instagram.com OR site:tiktok.com)";

/**
 * The news feeds for one sport. Site-specific Google News queries come first so
 * their source type wins when the general query returns the same story.
 *
 * Direct feeds from AuburnTigers.com, AL.com, The Plainsman, College & Magnolia
 * and YouTube fail or come back empty from Vercel, so those outlets are reached
 * through Google News instead.
 */
function sourcesFor(sport: SportId, word: string): NewsSource[] {
  return [
    {
      id: `${sport}-official`,
      name: "AuburnTigers.com",
      url: googleNews(`${word} site:auburntigers.com`),
      type: "official",
      filter: "sport",
    },
    {
      id: `${sport}-video`,
      name: "YouTube",
      url: googleNews(`"Auburn ${word}" site:youtube.com`),
      type: "video",
      filter: "broad",
    },
    {
      id: `${sport}-social`,
      name: "Social",
      url: googleNews(`"Auburn ${word}" ${SOCIAL_SITES}`),
      type: "social",
      filter: "broad",
    },
    {
      id: `${sport}-news`,
      name: "Google News",
      url: googleNews(`"Auburn ${word}"`),
      type: "media",
      filter: "none",
    },
    {
      id: `${sport}-reddit`,
      name: "r/wde (Reddit)",
      url: "https://www.reddit.com/r/wde/.rss",
      type: "social",
      filter: "auburn-sports",
    },
  ];
}

const FOOTBALL_UNITS: Record<string, string> = {
  offense: "Offense",
  defense: "Defense",
  specialteam: "Special Teams",
  specialteams: "Special Teams",
};

const BASKETBALL_GROUPS: Record<string, string> = {
  G: "Guards",
  PG: "Guards",
  SG: "Guards",
  F: "Forwards",
  SF: "Forwards",
  PF: "Forwards",
  C: "Centers",
};

export const SPORTS: Record<SportId, SportConfig> = {
  football: {
    id: "football",
    name: "Football",
    shortName: "Football",
    espnPath: "football/college-football",
    sources: sourcesFor("football", "football"),
    terms: [
      "football",
      "quarterback",
      "qb",
      "touchdown",
      "recruit",
      "recruits",
      "recruiting",
      "commit",
      "commits",
      "commitment",
      "transfer portal",
      "golesh",
      "fb",
      "bye week",
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
    ],
    markers: ["football"],
    auburnPattern: /\bauburn\b|\bwar eagle\b|\bgolesh\b/i,
    positionGroups: ["Offense", "Defense", "Special Teams"],
    groupOf: (_position, espnGroup) => FOOTBALL_UNITS[(espnGroup ?? "").toLowerCase()] ?? "Special Teams",
  },
  basketball: {
    id: "basketball",
    name: "Men's Basketball",
    shortName: "Basketball",
    espnPath: "basketball/mens-college-basketball",
    sources: sourcesFor("basketball", "basketball"),
    terms: [
      "basketball",
      "hoops",
      "mbb",
      "neville arena",
      "tip-off",
      "tipoff",
      "point guard",
      "rebound",
      "rebounds",
      "three-pointer",
      "3-pointer",
      "double-double",
      "sec tournament",
      "ncaa tournament",
      "march madness",
      "sweet 16",
      "sweet sixteen",
      "elite eight",
      "final four",
      "bracketology",
    ],
    markers: ["basketball", "hoops"],
    auburnPattern: /\bauburn\b|\bwar eagle\b/i,
    positionGroups: ["Guards", "Forwards", "Centers"],
    groupOf: (position) => BASKETBALL_GROUPS[position.toUpperCase()] ?? "Forwards",
  },
};

export function isSportId(value: string): value is SportId {
  return (SPORT_IDS as readonly string[]).includes(value);
}
