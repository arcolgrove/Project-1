import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Football is the default sport for now; temporary so it can change.
      { source: "/", destination: "/football", permanent: false },
      // Pages from before the site covered more than one sport.
      { source: "/schedule", destination: "/football/schedule", permanent: true },
      { source: "/roster", destination: "/football/roster", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Browsers must always re-check the service worker so updates roll out right away.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
