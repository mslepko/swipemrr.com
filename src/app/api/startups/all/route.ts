import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { fetchAllStartups, RateLimitError } from "@/lib/trustmrr";

const getCachedStartups = unstable_cache(
  async () => {
    const startups = await fetchAllStartups();
    return { startups, fetchedAt: Date.now() };
  },
  ["all-startups"],
  { revalidate: 86400, tags: ["all-startups"] }
);

export async function GET() {
  try {
    const { startups, fetchedAt } = await getCachedStartups();
    return NextResponse.json({
      data: startups,
      meta: { total: startups.length, fetchedAt },
    });
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
