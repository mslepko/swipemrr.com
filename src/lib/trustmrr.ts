import { RawTrustMRRStartup, TrustMRRStartup, ApiResponse } from "./types";

const BASE_URL = "https://trustmrr.com/api/v1";

function normalizeStartup(raw: RawTrustMRRStartup): TrustMRRStartup {
  return {
    name: raw.name,
    slug: raw.slug,
    category: raw.category,
    description: raw.description,
    mrr: raw.revenue?.mrr,
    totalRevenue: raw.revenue?.total,
    last30DaysRevenue: raw.revenue?.last30Days,
    growth30d: raw.growth30d,
    onSale: raw.onSale,
    askingPrice: raw.askingPrice,
    multiple: raw.multiple,
    logo: raw.icon,
    foundedDate: raw.foundedDate,
    customers: raw.customers,
  };
}

interface RawApiResponse {
  data: RawTrustMRRStartup[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_RETRIES = 3;

export async function fetchStartups(
  params: Record<string, string>
): Promise<ApiResponse> {
  const apiKey = process.env.TRUSTMRR_API_KEY;
  if (!apiKey) {
    throw new Error("TRUSTMRR_API_KEY is not configured");
  }

  const url = new URL(`${BASE_URL}/startups`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 429) {
      const resetHeader = res.headers.get("X-RateLimit-Reset");
      const retryAfter = resetHeader
        ? Math.max(0, Number(resetHeader) * 1000 - Date.now())
        : 2000 * Math.pow(2, attempt);

      if (attempt < MAX_RETRIES) {
        const delay = Math.min(retryAfter, 30000);
        await sleep(delay);
        continue;
      }
      throw new RateLimitError(retryAfter);
    }

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const raw: RawApiResponse = await res.json();

    return {
      data: raw.data.map(normalizeStartup),
      meta: raw.meta,
    };
  }

  throw new Error("Unexpected: exhausted retries");
}

export async function fetchAllStartups(): Promise<TrustMRRStartup[]> {
  const all: TrustMRRStartup[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await fetchStartups({
      onSale: "true",
      limit: "200",
      page: String(page),
    });
    all.push(...data.data);
    hasMore = data.meta.hasMore;
    page++;
  }

  return all;
}

export class RateLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super("Rate limited");
    this.retryAfter = retryAfter;
  }
}
