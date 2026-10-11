"use client";

import { useMemo, useState } from "react";
import { timeAgo } from "@/lib/format";
import type { NewsItem, SourceType } from "@/lib/types";

const FILTERS: { value: SourceType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "media", label: "Media" },
  { value: "official", label: "Official" },
  { value: "social", label: "Social" },
  { value: "video", label: "Video" },
];

const BADGE: Record<SourceType, string> = {
  media: "bg-navy text-white",
  official: "bg-orange text-navy",
  social: "bg-sky-600 text-white",
  video: "bg-red-600 text-white",
};

export default function NewsFeed({ items }: { items: NewsItem[] }) {
  const [filter, setFilter] = useState<SourceType | "all">("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (filter === "all" || item.sourceType === filter) &&
        (!q || `${item.title} ${item.summary ?? ""} ${item.source}`.toLowerCase().includes(q)),
    );
  }, [items, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by source type">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                filter === f.value
                  ? "border-orange bg-orange text-navy"
                  : "border-border bg-surface hover:border-orange"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search headlines…"
          className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-orange sm:w-64"
        />
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface p-6 text-center text-muted">
          No stories match right now. Check back soon.
        </p>
      ) : (
        <ul className="grid gap-3">
          {visible.map((item) => (
            <li key={item.id}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 rounded-lg border border-border bg-surface p-4 transition hover:border-orange hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${BADGE[item.sourceType]}`}>
                      {item.sourceType}
                    </span>
                    <span className="font-semibold text-foreground">{item.source}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={item.publishedAt} suppressHydrationWarning>
                      {timeAgo(item.publishedAt)}
                    </time>
                  </div>
                  <h2 className="font-bold leading-snug">{item.title}</h2>
                  {item.summary && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.summary}</p>}
                </div>
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="hidden h-20 w-28 shrink-0 rounded-md object-cover sm:block"
                  />
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
