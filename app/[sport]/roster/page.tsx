import type { Metadata } from "next";
import Notice from "@/components/Notice";
import RosterTable from "@/components/RosterTable";
import { getRoster } from "@/lib/espn";
import { sportFromParams, type SportParams } from "@/lib/route-params";

export const revalidate = 86400;

export async function generateMetadata(props: SportParams): Promise<Metadata> {
  return { title: `${(await sportFromParams(props)).name} Roster` };
}

export default async function RosterPage(props: SportParams) {
  const sport = await sportFromParams(props);
  if (sport.officialRosterUrl) {
    return (
      <>
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">{sport.name} Roster</h1>
        <div className="rounded-lg border border-border bg-surface p-6 text-center">
          <p className="mb-4 text-muted">
            ESPN doesn&apos;t publish a reliable current {sport.name.toLowerCase()} roster, so it isn&apos;t shown here.
          </p>
          <a
            href={sport.officialRosterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white"
          >
            View the official roster on AuburnTigers.com
          </a>
        </div>
      </>
    );
  }
  const { data: players, isFallback, isEmpty } = await getRoster(sport.id);
  const noPositions = players.length > 0 && players.every((p) => !p.positionGroup);
  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight">{sport.name} Roster</h1>
      {isFallback && <Notice>Live roster unavailable. Showing placeholder sample data.</Notice>}
      {isEmpty ? (
        <Notice>ESPN hasn&apos;t published the {sport.name.toLowerCase()} roster yet. Check back closer to the season.</Notice>
      ) : (
        <>
          {noPositions && (
            <Notice>ESPN doesn&apos;t list positions or class years for this roster, and it may include former players.</Notice>
          )}
          <RosterTable players={players} groups={sport.positionGroups} />
        </>
      )}
    </>
  );
}
