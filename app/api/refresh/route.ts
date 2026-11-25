import { SPORT_IDS } from "@/lib/sports";

// Always run; never serve this route itself from the cache.
export const dynamic = "force-dynamic";

const PAGE_TIMEOUT_MS = 20_000;

/** Every cached page on the site, so a refresh request warms all of them. */
function sitePaths(): string[] {
  return SPORT_IDS.flatMap((sport) => [
    `/${sport}`,
    `/${sport}/schedule`,
    `/${sport}/roster`,
    `/api/${sport}/news`,
  ]);
}

/**
 * Keep-fresh endpoint for uptime/cron services.
 *
 * Vercel only regenerates a cached page when someone requests it after it
 * expires. Requesting every page here starts those background refreshes, so
 * real visitors get recent news even after a quiet stretch. The response is a
 * short summary, because cron services reject large responses such as the
 * news pages themselves.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const pages = await Promise.all(
    sitePaths().map(async (path) => {
      try {
        const res = await fetch(`${origin}${path}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
        });
        await res.arrayBuffer(); // read the body so the request completes
        const age = res.headers.get("age");
        return {
          path,
          status: res.status,
          cache: res.headers.get("x-vercel-cache") ?? undefined,
          ageSeconds: age === null ? undefined : Number(age),
        };
      } catch (err) {
        return { path, status: 0, error: err instanceof Error ? err.message : String(err) };
      }
    }),
  );
  const ok = pages.every((p) => p.status === 200);
  return Response.json({ ok, checkedAt: new Date().toISOString(), pages }, { status: ok ? 200 : 502 });
}
