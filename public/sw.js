// Service worker for Auburn Football Hub: lets the site open offline and be installed.
// Bump CACHE_VERSION whenever this file's caching behavior changes.
const CACHE_VERSION = "v1";
const CACHE = `au-football-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE = [
  "/",
  "/schedule",
  "/roster",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Cache what we can; one failed page shouldn't stop the worker installing.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
  return response;
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Leave cross-origin requests (news images, ESPN headshots) and non-GETs to the browser.
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, OFFLINE_URL));
  } else if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico)$/.test(url.pathname)) {
    // Build assets have content-hashed names, so a cached copy never goes stale.
    event.respondWith(cacheFirst(request));
  } else {
    // API responses and in-app (client-side) page navigations.
    event.respondWith(networkFirst(request));
  }
});
