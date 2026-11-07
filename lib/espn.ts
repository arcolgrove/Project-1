import basketballRoster from "@/data/basketball-roster.json";
import basketballSchedule from "@/data/basketball-schedule.json";
import footballRoster from "@/data/football-roster.json";
import footballSchedule from "@/data/football-schedule.json";
import { SPORTS, type SportId } from "./sports";
import type { DataResult, Game, Player } from "./types";

/** ESPN's team id for Auburn (the same for every sport). These are ESPN's public (unofficial) site endpoints. */
export const AUBURN_ESPN_ID = "2";
const teamUrl = (sport: SportId) =>
  `https://site.api.espn.com/apis/site/v2/sports/${SPORTS[sport].espnPath}/teams/${AUBURN_ESPN_ID}`;

/** Placeholder data shown, with a notice, when ESPN can't be reached. */
const FALLBACK: Record<SportId, { roster: Player[]; schedule: Game[] }> = {
  football: { roster: footballRoster, schedule: footballSchedule as Game[] },
  basketball: { roster: basketballRoster, schedule: basketballSchedule as Game[] },
};
const TIMEOUT_MS = 8000;

// Loose shapes of the ESPN payloads; every field is treated as optional.
interface EspnAthlete {
  id?: string;
  fullName?: string;
  displayName?: string;
  jersey?: string;
  position?: { abbreviation?: string; name?: string };
  experience?: { displayValue?: string; abbreviation?: string };
  displayHeight?: string;
  displayWeight?: string;
  birthPlace?: { city?: string; state?: string; country?: string };
  headshot?: { href?: string };
}

interface EspnCompetitor {
  id?: string;
  homeAway?: "home" | "away";
  winner?: boolean;
  score?: { value?: number; displayValue?: string } | string;
  team?: { id?: string; displayName?: string; logos?: { href?: string }[]; logo?: string };
}

interface EspnEvent {
  id?: string;
  date?: string;
  timeValid?: boolean;
  competitions?: {
    neutralSite?: boolean;
    venue?: { fullName?: string; address?: { city?: string; state?: string } };
    broadcasts?: { media?: { shortName?: string } }[];
    status?: { type?: { state?: string; completed?: boolean } };
    competitors?: EspnCompetitor[];
  }[];
}

type EspnGroup = { position?: string; items?: EspnAthlete[] };

/**
 * ESPN returns football rosters grouped by unit (`athletes: [{ position, items }]`)
 * and basketball rosters as a flat list (`athletes: [athlete]`); accept both.
 */
export function normalizeRoster(json: unknown, sport: SportId): Player[] {
  const athletes = (json as { athletes?: (EspnAthlete | EspnGroup)[] })?.athletes;
  if (!Array.isArray(athletes)) throw new Error("Unexpected roster payload");
  const groups: EspnGroup[] = athletes.some((a) => "items" in a)
    ? (athletes as EspnGroup[])
    : [{ items: athletes as EspnAthlete[] }];
  const players: Player[] = [];
  for (const group of groups) {
    for (const a of group.items ?? []) {
      const name = a.fullName ?? a.displayName;
      if (!a.id || !name) continue;
      const position = a.position?.abbreviation ?? "—";
      const hometown = [a.birthPlace?.city, a.birthPlace?.state ?? a.birthPlace?.country]
        .filter(Boolean)
        .join(", ");
      players.push({
        id: a.id,
        name,
        number: a.jersey,
        position,
        positionGroup: SPORTS[sport].groupOf(position, group.position),
        classYear: a.experience?.displayValue,
        height: a.displayHeight,
        weight: a.displayWeight,
        hometown: hometown || undefined,
        headshot: a.headshot?.href,
      });
    }
  }
  return players;
}

function scoreOf(c: EspnCompetitor): number | undefined {
  if (typeof c.score === "string") return Number(c.score);
  if (c.score?.value !== undefined) return c.score.value;
  if (c.score?.displayValue !== undefined) return Number(c.score.displayValue);
  return undefined;
}

export function normalizeSchedule(json: unknown): Game[] {
  const events = (json as { events?: EspnEvent[] })?.events;
  if (!Array.isArray(events)) throw new Error("Unexpected schedule payload");
  const games: Game[] = [];
  for (const e of events) {
    const comp = e.competitions?.[0];
    const competitors = comp?.competitors ?? [];
    const auburn = competitors.find((c) => (c.team?.id ?? c.id) === AUBURN_ESPN_ID);
    const opp = competitors.find((c) => c !== auburn);
    if (!e.id || !e.date || !auburn || !opp) continue;

    const state = comp?.status?.type?.state;
    const status: Game["status"] = state === "post" ? "final" : state === "in" ? "in_progress" : "scheduled";
    const auburnScore = scoreOf(auburn);
    const opponentScore = scoreOf(opp);
    const venueCity = [comp?.venue?.address?.city, comp?.venue?.address?.state].filter(Boolean).join(", ");

    games.push({
      id: e.id,
      date: e.date,
      timeTbd: e.timeValid === false,
      opponent: opp.team?.displayName ?? "TBD",
      opponentLogo: opp.team?.logos?.[0]?.href ?? opp.team?.logo,
      homeAway: comp?.neutralSite ? "neutral" : (auburn.homeAway ?? "home"),
      venue: [comp?.venue?.fullName, venueCity].filter(Boolean).join(" · ") || undefined,
      tv: comp?.broadcasts?.[0]?.media?.shortName,
      status,
      result:
        status !== "scheduled" && auburnScore !== undefined && opponentScore !== undefined
          ? { auburnScore, opponentScore, win: auburn.winner ?? auburnScore > opponentScore }
          : undefined,
    });
  }
  return games.sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchJson(sport: SportId, path: string, revalidate: number): Promise<unknown> {
  const res = await fetch(`${teamUrl(sport)}${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`ESPN ${sport}${path}: HTTP ${res.status}`);
  return res.json();
}

async function withFallback<T>(load: () => Promise<T>, fallback: T, label: string): Promise<DataResult<T>> {
  try {
    const data = await load();
    if (Array.isArray(data) && data.length === 0) throw new Error("empty response");
    return { data, isFallback: false };
  } catch (err) {
    console.warn(`[espn] ${label} unavailable, using bundled sample data:`, err);
    return { data: fallback, isFallback: true };
  }
}

export function getRoster(sport: SportId): Promise<DataResult<Player[]>> {
  return withFallback(
    async () => normalizeRoster(await fetchJson(sport, "/roster", 86400), sport),
    FALLBACK[sport].roster,
    `${sport} roster`,
  );
}

export function getSchedule(sport: SportId): Promise<DataResult<Game[]>> {
  return withFallback(
    async () => normalizeSchedule(await fetchJson(sport, "/schedule", 3600)),
    FALLBACK[sport].schedule,
    `${sport} schedule`,
  );
}
