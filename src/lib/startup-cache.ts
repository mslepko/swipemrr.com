import { unstable_cache } from "next/cache";
import {
  fetchStartupsPage,
  RateLimitError,
  StartupPage,
  withNo429Retries,
} from "./trustmrr";
import { TrustMRRStartup } from "./types";

// Tag for the individual TrustMRR page entries. Hard-expired once a day by
// /api/cron/expire; never expires on its own, so reading a warm page never
// triggers an upstream request.
//
// IMPORTANT (Next 16 semantics, verified against next/dist):
// - revalidateTag() is queued per-request and only flushed AFTER the request
//   (including after() callbacks) finishes, stamped with the flush time. Any
//   cache entry written earlier in that same request is retroactively
//   expired. That's why expiring this tag lives in a dedicated cron route
//   that does nothing else, and why the warm chain never calls
//   revalidateTag.
// - unstable_cache calls nested inside another unstable_cache callback
//   bypass cache reads entirely. getCachedPage must only be called at the
//   top level of route handlers, never from inside another cached function.
export const PAGES_TAG = "tm-pages";

// 1,880 on-sale startups today = 188 pages; 400 leaves 2x headroom while
// still bounding a runaway `hasMore` from the upstream API.
export const MAX_PAGES = 400;

// How long snapshot composition may spend before returning a partial
// result. Irrelevant when pages are warm (composition is pure cache reads);
// only bounds the path where pages are missing or expired and have to be
// fetched upstream. Overridable for integration tests.
const COMPOSE_BUDGET_MS = Number(
  process.env.SNAPSHOT_COMPOSE_BUDGET_MS ?? 45_000
);

// unstable_cache includes serialized arguments in the cache key, so each
// page number gets its own entry.
export const getCachedPage = unstable_cache(
  async (page: number): Promise<StartupPage> => fetchStartupsPage(page),
  ["tm-page-v1"],
  { revalidate: false, tags: [PAGES_TAG] }
);

export interface Snapshot {
  startups: TrustMRRStartup[];
  fetchedAt: number;
  complete: boolean;
  pages: number;
}

// Assemble the full list from the per-page cache entries. Pages already in
// the cache cost no upstream requests; missing pages are fetched until the
// budget runs out or the upstream rate limit trips (no retry sleeps on this
// path), in which case the snapshot is marked incomplete and the caller
// signals downstream caches to retry soon. Progress is monotonic: pages
// fetched by an incomplete compose stay cached for the next attempt.
// Throws RateLimitError only when there is nothing cached at all.
export function composeSnapshot(): Promise<Snapshot> {
  return withNo429Retries(async () => {
    const started = Date.now();
    const deadline = started + COMPOSE_BUDGET_MS;
    const seen = new Set<string>();
    const startups: TrustMRRStartup[] = [];

    const addPage = (result: StartupPage) => {
      for (const s of result.items) {
        if (!seen.has(s.slug)) {
          seen.add(s.slug);
          startups.push(s);
        }
      }
    };

    const first = await getCachedPage(1);
    addPage(first);

    let page = 1;
    let hasMore = first.hasMore;

    while (hasMore && page < MAX_PAGES && Date.now() <= deadline) {
      try {
        const result = await getCachedPage(page + 1);
        page++;
        addPage(result);
        hasMore = result.hasMore;
      } catch (error) {
        if (error instanceof RateLimitError) break;
        throw error;
      }
    }

    // `hasMore` is authoritative for completeness (the total can shift while
    // a rebuild is paginating).
    const complete = !hasMore;
    console.log("[compose] snapshot", {
      pages: page,
      items: startups.length,
      complete,
      ms: Date.now() - started,
    });
    return { startups, fetchedAt: Date.now(), complete, pages: page };
  });
}
