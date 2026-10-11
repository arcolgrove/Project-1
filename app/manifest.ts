import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Auburn Football Hub",
    short_name: "AU Football",
    description: "Latest Auburn Tigers football news, roster and schedule.",
    start_url: "/",
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
