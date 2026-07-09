import { NextResponse } from "next/server";
import { composeSnapshot } from "@/lib/startup-cache";
import { RateLimitError } from "@/lib/trustmrr";

// Composition from warm page caches takes a few seconds; Vercel's CDN caches
// the response (s-maxage) and serves it instantly, refreshing in the
// background (stale-while-revalidate) so users never wait on a rebuild.
export const dynamic = "force-dynamic";

const COMPLETE_CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=86400";
// Partial snapshots (cold cache after a fresh deploy) should be retried
// quickly; each retry makes monotonic progress since fetched pages stay
// cached.
const PARTIAL_CACHE_CONTROL =
  "public, s-maxage=60, stale-while-revalidate=300";

export async function GET() {
  try {
    const snapshot = await composeSnapshot();

    return NextResponse.json(
      {
        data: snapshot.startups,
        meta: {
          total: snapshot.startups.length,
          fetchedAt: snapshot.fetchedAt,
          complete: snapshot.complete,
        },
      },
      {
        headers: {
          "Cache-Control": snapshot.complete
            ? COMPLETE_CACHE_CONTROL
            : PARTIAL_CACHE_CONTROL,
        },
      }
    );
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch startups" },
      { status: 500 }
    );
  }
}
