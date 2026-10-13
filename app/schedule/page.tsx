import type { Metadata } from "next";
import Notice from "@/components/Notice";
import { getSchedule } from "@/lib/espn";
import { gameDate, gameTime } from "@/lib/format";
import type { Game } from "@/lib/types";

export const metadata: Metadata = { title: "Schedule" };
export const revalidate = 3600;

function Matchup({ game }: { game: Game }) {
  const prefix = game.homeAway === "away" ? "at" : game.homeAway === "neutral" ? "vs (N)" : "vs";
  return (
    <div className="flex min-w-0 items-center gap-3">
      {game.opponentLogo ? (
        <img src={game.opponentLogo} alt="" className="h-9 w-9 shrink-0 object-contain" />
      ) : (
        <span className="h-9 w-9 shrink-0 rounded-full bg-border" />
      )}
      <div className="min-w-0">
        <div className="truncate font-bold">
          <span className="font-normal text-muted">{prefix} </span>
          {game.opponent}
        </div>
        {game.venue && <div className="truncate text-xs text-muted">{game.venue}</div>}
      </div>
    </div>
  );
}

function Outcome({ game }: { game: Game }) {
  if (game.result) {
    const { auburnScore, opponentScore, win } = game.result;
    return (
      <div className="text-right font-bold tabular-nums">
        {game.status === "in_progress" ? (
          <span className="text-orange">LIVE </span>
        ) : (
          <span className={win ? "text-green-600" : "text-red-600"}>{win ? "W " : "L "}</span>
        )}
        {auburnScore}–{opponentScore}
      </div>
    );
  }
  return (
    <div className="text-right text-sm">
      <div className="font-semibold">{gameTime(game.date, game.timeTbd)}</div>
      {game.tv && <div className="text-xs text-muted">{game.tv}</div>}
    </div>
  );
}

export default async function SchedulePage() {
  const { data: games, isFallback } = await getSchedule();
  const finals = games.filter((g) => g.status === "final" && g.result);
  const wins = finals.filter((g) => g.result!.win).length;
  const next = games.find((g) => g.status !== "final");

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Schedule</h1>
        {finals.length > 0 && (
          <p className="text-sm font-semibold">
            Record: {wins}–{finals.length - wins}
          </p>
        )}
      </div>
      {isFallback && <Notice>Live schedule unavailable. Showing placeholder sample data.</Notice>}

      {next && (
        <section className="mb-6 rounded-lg bg-navy p-4 text-white">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-orange">
            {next.status === "in_progress" ? "Live now" : "Next game"} · {gameDate(next.date)}
          </p>
          <div className="flex items-center justify-between gap-4">
            <Matchup game={next} />
            <Outcome game={next} />
          </div>
        </section>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {games.map((game) => (
          <li key={game.id} className="grid grid-cols-[5.25rem_1fr_auto] items-center gap-3 px-4 py-3">
            <div className="text-xs font-semibold uppercase text-muted">{gameDate(game.date)}</div>
            <Matchup game={game} />
            <Outcome game={game} />
          </li>
        ))}
      </ul>
    </>
  );
}
