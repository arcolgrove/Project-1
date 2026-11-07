"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isSportId, SPORT_IDS, SPORTS, type SportId } from "@/lib/sports";

const TABS = [
  { path: "", label: "News" },
  { path: "/schedule", label: "Schedule" },
  { path: "/roster", label: "Roster" },
];

/** Site header: sport switch (keeps the current tab) and the sport's News / Schedule / Roster tabs. */
export default function SiteHeader() {
  const [, first = "", rest = ""] = usePathname().match(/^\/([^/]*)(.*)$/) ?? [];
  const sport: SportId = isSportId(first) ? first : "football";
  const tab = isSportId(first) ? rest.replace(/\/$/, "") : "";

  return (
    <header className="sticky top-0 z-10 border-b-4 border-orange bg-navy text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link href={`/${sport}`} className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-orange text-sm text-navy">AU</span>
          <span className="hidden sm:inline">Auburn Sports Hub</span>
        </Link>

        <div className="flex rounded-full bg-white/10 p-1 text-sm font-bold" role="group" aria-label="Choose sport">
          {SPORT_IDS.map((id) => (
            <Link
              key={id}
              href={`/${id}${tab}`}
              aria-current={id === sport ? "true" : undefined}
              className={`rounded-full px-3 py-1 transition ${
                id === sport ? "bg-orange text-navy" : "text-white/80 hover:text-white"
              }`}
            >
              {SPORTS[id].shortName}
            </Link>
          ))}
        </div>

        <nav className="flex w-full gap-1 text-sm font-semibold sm:w-auto" aria-label={`${SPORTS[sport].name} sections`}>
          {TABS.map((t) => {
            const active = isSportId(first) && t.path === tab;
            return (
              <Link
                key={t.label}
                href={`/${sport}${t.path}`}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 ${active ? "bg-white/15" : "hover:bg-white/10"}`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
