import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { PAGES_TAG } from "@/lib/startup-cache";

// Expires the per-page TrustMRR cache entries so the warm chain
// (/api/cron/refresh, scheduled 90 minutes later) re-fetches today's data.
//
// This request must do NOTHING besides revalidateTag: in Next 16 the tag
// expiry is flushed at end-of-request with the flush time as its timestamp,
// which retroactively expires every cache entry written earlier in the same
// request. Keeping the expiry isolated here (and the warm chain free of
// revalidateTag calls) guarantees the chain's writes survive. The 90-minute
// cron gap covers Hobby's ~1 hour cron jitter so expiry always lands before
// the warm run starts.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(PAGES_TAG, { expire: 0 });

  return NextResponse.json({ expired: PAGES_TAG, now: Date.now() });
}
