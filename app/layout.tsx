import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Auburn Football Hub", template: "%s · Auburn Football Hub" },
  description: "The latest Auburn Tigers football news from across the web, plus the roster and schedule.",
  appleWebApp: { capable: true, title: "AU Football", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0c2340",
};

const NAV = [
  { href: "/", label: "News" },
  { href: "/schedule", label: "Schedule" },
  { href: "/roster", label: "Roster" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-10 border-b-4 border-orange bg-navy text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-orange text-sm text-navy">AU</span>
              <span className="hidden sm:inline">Auburn Football Hub</span>
            </Link>
            <nav className="flex gap-1 text-sm font-semibold">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-md px-3 py-1.5 hover:bg-white/10">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-muted">
          Independent fan app, not affiliated with Auburn University. Headlines link to their original publishers.
          Roster and schedule data from ESPN.
        </footer>
      </body>
    </html>
  );
}
