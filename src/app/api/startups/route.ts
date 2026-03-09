import { NextRequest, NextResponse } from "next/server";
import { fetchStartups, RateLimitError } from "@/lib/trustmrr";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params: Record<string, string> = {};

  const allowedParams = [
    "onSale",
    "category",
    "minRevenue",
    "maxRevenue",
    "minMrr",
    "maxMrr",
    "minGrowth",
    "maxGrowth",
    "minPrice",
    "maxPrice",
    "page",
    "limit",
    "sort",
  ];

  for (const key of allowedParams) {
    const value = searchParams.get(key);
    if (value !== null) {
      params[key] = value;
    }
  }

  try {
    const data = await fetchStartups(params);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Too many requests, please wait a moment" },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch startups" },
      { status: 500 }
    );
  }
}
