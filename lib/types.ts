export type SourceType = "media" | "social" | "video" | "official";

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  /**
   * Relevance filter applied to each item:
   * - "none": the feed only covers Auburn football.
   * - "football": items must use a football term (feeds whose headlines rarely name the sport).
   * - "auburn-sports": an all-sports Auburn feed; drop items about other sports.
   * - "broad": items must mention Auburn, then are filtered like "auburn-sports".
   */
  filter: "none" | "football" | "auburn-sports" | "broad";
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
