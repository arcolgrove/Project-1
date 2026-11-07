import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Auburn Sports Hub",
    short_name: "AU Sports",
    description: "Latest Auburn Tigers football and men's basketball news, rosters and schedules.",
    // Open a real page, not the "/" redirect, so the installed app also starts offline.
    start_url: "/football",
    display: "standalone",
    background_color: "#0c2340",
    theme_color: "#0c2340",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
