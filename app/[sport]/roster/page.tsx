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
  const { data: players, isFallback } = await getRoster(sport.id);
  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight">{sport.name} Roster</h1>
      {isFallback && <Notice>Live roster unavailable. Showing placeholder sample data.</Notice>}
      <RosterTable players={players} groups={sport.positionGroups} />
    </>
  );
}
