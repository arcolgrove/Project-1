import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 text-center">
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight">You&apos;re offline</h1>
      <p className="mb-4 text-muted">
        This page hasn&apos;t been saved yet. Pages you&apos;ve already opened still work without a connection.
      </p>
      <div className="flex justify-center gap-2 text-sm font-semibold">
        <Link href="/" className="rounded-md bg-navy px-3 py-1.5 text-white">
          News
        </Link>
        <Link href="/schedule" className="rounded-md bg-navy px-3 py-1.5 text-white">
          Schedule
        </Link>
        <Link href="/roster" className="rounded-md bg-navy px-3 py-1.5 text-white">
          Roster
        </Link>
      </div>
    </div>
  );
}
