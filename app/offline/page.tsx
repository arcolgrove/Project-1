import type { Metadata } from "next";
import Link from "next/link";
import { SPORT_IDS, SPORTS } from "@/lib/sports";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 text-center">
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight">You&apos;re offline</h1>
      <p className="mb-2 text-muted">
        This page hasn&apos;t been saved yet. Pages you&apos;ve already opened still work without a connection.
      </p>
      {SPORT_IDS.map((sport) => (
        <div key={sport} className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
          <span className="w-full sm:w-auto">{SPORTS[sport].name}:</span>
          {[
            ["", "News"],
            ["/schedule", "Schedule"],
            ["/roster", "Roster"],
          ].map(([path, label]) => (
            <Link key={label} href={`/${sport}${path}`} className="rounded-md bg-navy px-3 py-1.5 text-white">
              {label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
