import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Invalidate the stale cache entry; a second cron at 06:01 hits
  // /api/startups/all to warm it externally
  revalidateTag("all-startups", { expire: 0 });

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
