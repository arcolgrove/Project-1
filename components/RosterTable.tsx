"use client";

import { useMemo, useState } from "react";
import type { Player } from "@/lib/types";

const GROUPS = ["All", "Offense", "Defense", "Special Teams"] as const;

export default function RosterTable({ players }: { players: Player[] }) {
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("All");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players
      .filter((p) => group === "All" || p.positionGroup === group)
      .filter((p) => !q || `${p.name} ${p.position} ${p.number ?? ""} ${p.hometown ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => Number(a.number ?? 999) - Number(b.number ?? 999));
  }, [players, group, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by unit">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              aria-pressed={group === g}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                group === g ? "border-orange bg-orange text-navy" : "border-border bg-surface hover:border-orange"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, position, hometown…"
          className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-orange sm:w-72"
        />
      </div>

      <p className="text-xs text-muted">{visible.length} players</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
            {p.headshot ? (
              <img src={p.headshot} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-full bg-border object-cover" />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-navy text-lg font-extrabold text-orange">
                {p.number ?? "—"}
              </span>
            )}
            <div className="min-w-0">
              <div className="truncate font-bold">
                {p.number && <span className="text-orange">#{p.number} </span>}
                {p.name}
              </div>
              <div className="text-sm">
                {p.position}
                {p.classYear && <span className="text-muted"> · {p.classYear}</span>}
              </div>
              <div className="truncate text-xs text-muted">
                {[p.height, p.weight, p.hometown].filter(Boolean).join(" · ")}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
