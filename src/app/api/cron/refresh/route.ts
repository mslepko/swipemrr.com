import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getCachedPage, MAX_PAGES } from "@/lib/startup-cache";
import { getUpstreamStats, sleep } from "@/lib/trustmrr";

export const maxDuration = 300;

// A full TrustMRR pull is ~188 pages at 20 requests/minute (~10 minutes of
// wall time), which cannot fit in one 300s Hobby invocation. Each invocation
// of this route warms pages for a bounded budget, then triggers the next
// link in the chain by fetching itself with a cursor. Links respond 202
// immediately and do their work in after(), so the self-fetch that starts
// the next link costs ~1s, not the link's whole runtime.
//
// The chain deliberately never calls revalidateTag — /api/cron/expire does
// that in its own request beforehand (see the comment there). Pages already
// warmed by a previous link are cache hits, so a link resuming at cursor N
// fast-forwards for free.
const CHUNK_BUDGET_MS = Number(process.env.WARM_CHUNK_BUDGET_MS ?? 240_000);
const MAX_CHAIN_DEPTH = 8;
const MAX_PACE_SLEEP_MS = 65_000;

function selfBaseUrl(request: NextRequest): string {
  return process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const cursor = Math.max(1, Number(params.get("cursor")) || 1);
  const depth = Math.max(0, Number(params.get("depth")) || 0);
  if (depth > MAX_CHAIN_DEPTH) {
    console.error("[warm] chain depth exceeded, aborting", { cursor, depth });
    return NextResponse.json({ error: "Chain depth exceeded" }, { status: 500 });
  }

  const baseUrl = selfBaseUrl(request);
  after(() => warmChunk(baseUrl, cursor, depth));

  return NextResponse.json({ accepted: true, cursor, depth }, { status: 202 });
}

async function warmChunk(baseUrl: string, cursor: number, depth: number) {
  const deadline = Date.now() + CHUNK_BUDGET_MS;
  let page = cursor;

  try {
    while (page <= MAX_PAGES) {
      const fetchesBefore = getUpstreamStats().fetches;
      const result = await getCachedPage(page);

      if (!result.hasMore) {
        console.log("[warm] all pages warm", { lastPage: page, depth });
        return;
      }
      page++;

      // Pace off the rate-limit headers, but only when this page actually
      // hit upstream — cache hits consume no rate budget.
      const stats = getUpstreamStats();
      if (
        stats.fetches > fetchesBefore &&
        stats.remaining === 0 &&
        stats.resetAtMs !== null
      ) {
        const waitMs = Math.min(
          Math.max(stats.resetAtMs - Date.now(), 0) + 250,
          MAX_PACE_SLEEP_MS
        );
        if (Date.now() + waitMs > deadline) break;
        await sleep(waitMs);
      }

      if (Date.now() > deadline) break;
    }

    if (page > MAX_PAGES) {
      console.error("[warm] hit MAX_PAGES with hasMore still true", { page });
      return;
    }

    console.log("[warm] budget spent, chaining", { nextCursor: page, depth });
    const res = await fetch(
      `${baseUrl}/api/cron/refresh?cursor=${page}&depth=${depth + 1}`,
      { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } }
    );
    if (!res.ok) {
      throw new Error(`Chain request failed: ${res.status}`);
    }
  } catch (error) {
    // Pages warmed so far are cached; tomorrow's run (or an on-demand
    // compose) picks up from where this one stopped.
    console.error("[warm] chunk failed", { page, depth, error });
  }
}
