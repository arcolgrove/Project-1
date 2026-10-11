export type SourceType = "media" | "social" | "video" | "official";

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  /** Feeds that only cover Auburn football skip the relevance filter. */
  auburnOnly: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceType: SourceType;
  publishedAt: string; // ISO 8601
  summary?: string;
  image?: string;
}

export interface NewsResult {
  items: NewsItem[];
  failedSources: string[];
  fetchedAt: string;
}

export interface Player {
  id: string;
  name: string;
  number?: string;
  position: string;
  positionGroup: "Offense" | "Defense" | "Special Teams";
  classYear?: string;
  height?: string;
  weight?: string;
  hometown?: string;
  headshot?: string;
}

export interface Game {
  id: string;
  date: string; // ISO 8601
  timeTbd: boolean;
  opponent: string;
  opponentLogo?: string;
  homeAway: "home" | "away" | "neutral";
  venue?: string;
  tv?: string;
  status: "scheduled" | "in_progress" | "final";
  result?: { auburnScore: number; opponentScore: number; win: boolean };
}

export interface DataResult<T> {
  data: T;
  /** True when live data could not be fetched and bundled sample data is shown. */
  isFallback: boolean;
}
