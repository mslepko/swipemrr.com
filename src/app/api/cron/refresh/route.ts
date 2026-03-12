import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Invalidate the stale cache entry
  revalidateTag("all-startups", { expire: 0 });

  // Best-effort cache warm — never fail the cron even if the endpoint is down
  let warmed = false;
  let total = 0;
  try {
    const origin = request.nextUrl.origin;
    const res = await fetch(`${origin}/api/startups/all`);
    if (res.ok) {
      const json = await res.json();
      warmed = true;
      total = json.meta?.total ?? 0;
    }
  } catch {
    // Swallow — warming is best-effort
  }

  return NextResponse.json({ revalidated: true, warmed, total, now: Date.now() });
}
