import type { Metadata, Viewport } from "next";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Auburn Sports Hub", template: "%s · Auburn Sports Hub" },
  description: "The latest Auburn Tigers football and men's basketball news from across the web, plus rosters and schedules.",
  appleWebApp: { capable: true, title: "AU Sports", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0c2340",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <RegisterServiceWorker />
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-muted">
          Independent fan app, not affiliated with Auburn University. Headlines link to their original publishers.
          Rosters and schedules from ESPN.
        </footer>
      </body>
    </html>
  );
}
