import type { Metadata } from "next";
import Notice from "@/components/Notice";
import RosterTable from "@/components/RosterTable";
import { getRoster } from "@/lib/espn";

export const metadata: Metadata = { title: "Roster" };
export const revalidate = 86400;

export default async function RosterPage() {
  const { data: players, isFallback } = await getRoster();
  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Roster</h1>
      {isFallback && <Notice>Live roster unavailable. Showing placeholder sample data.</Notice>}
      <RosterTable players={players} />
    </>
  );
}
