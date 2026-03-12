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

  // Warm the cache by hitting the endpoint so the next real user gets a fast response
  const origin = request.nextUrl.origin;
  const res = await fetch(`${origin}/api/startups/all`);
  const json = await res.json();

  return NextResponse.json({
    revalidated: true,
    warmed: res.ok,
    total: json.meta?.total ?? 0,
    now: Date.now(),
  });
}
