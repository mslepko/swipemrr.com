import { AsyncLocalStorage } from "node:async_hooks";
import { RawTrustMRRStartup, TrustMRRStartup, ApiResponse } from "./types";

const BASE_URL = process.env.TRUSTMRR_BASE_URL ?? "https://trustmrr.com/api/v1";

// User-facing composition must not sit in multi-second retry sleeps when the
// upstream rate limit is exhausted — it fails fast (throws RateLimitError on
// the first 429) and serves whatever is already cached. The warm chain keeps
// the default patient behavior. Scoped via AsyncLocalStorage so concurrent
// requests in the same process don't affect each other.
const fetchPolicy = new AsyncLocalStorage<{ retry429: boolean }>();

export function withNo429Retries<T>(fn: () => Promise<T>): Promise<T> {
  return fetchPolicy.run({ retry429: false }, fn);
}

// TrustMRR clamps every request to 10 items per page (documented max) and
// rate-limits to 20 requests/minute per API key.
export const PAGE_LIMIT = 10;

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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_RETRIES = 4;
const MAX_SLEEP_MS = 65_000;

// The reset header may be epoch seconds, epoch milliseconds, or a
// seconds-until-reset delta depending on the middleware. Normalize all
// three to "milliseconds from now".
function parseResetMs(header: string | null): number | null {
  if (!header) return null;
  const n = Number(header);
  if (!Number.isFinite(n) || n < 0) return null;
  if (n > 1e12) return Math.max(0, n - Date.now()); // epoch ms
  if (n > 1e9) return Math.max(0, n * 1000 - Date.now()); // epoch seconds
  return n * 1000; // delta seconds
}

// Rate-limit state observed on the most recent upstream response. The warm
// chain reads this between page fetches to pace itself instead of blundering
// into 429s. `fetches` lets callers tell a real upstream hit from a cache hit.
interface UpstreamStats {
  fetches: number;
  remaining: number | null;
  resetAtMs: number | null;
}

const stats: UpstreamStats = { fetches: 0, remaining: null, resetAtMs: null };

export function getUpstreamStats(): UpstreamStats {
  return { ...stats };
}

function recordRateHeaders(res: Response) {
  stats.fetches++;
  const remaining = res.headers.get("X-RateLimit-Remaining");
  stats.remaining =
    remaining !== null && remaining !== "" && Number.isFinite(Number(remaining))
      ? Number(remaining)
      : null;
  const resetMs = parseResetMs(res.headers.get("X-RateLimit-Reset"));
  stats.resetAtMs = resetMs !== null ? Date.now() + resetMs : null;
}

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
      cache: "no-store",
    });
    recordRateHeaders(res);

    if (res.status === 429) {
      const retryAfter =
        parseResetMs(res.headers.get("X-RateLimit-Reset")) ??
        2000 * Math.pow(2, attempt);

      const retry429 = fetchPolicy.getStore()?.retry429 ?? true;
      if (retry429 && attempt < MAX_RETRIES) {
        await sleep(Math.min(retryAfter + 250, MAX_SLEEP_MS));
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

export interface StartupPage {
  items: TrustMRRStartup[];
  total: number;
  page: number;
  hasMore: boolean;
}

export async function fetchStartupsPage(page: number): Promise<StartupPage> {
  const res = await fetchStartups({
    onSale: "true",
    limit: String(PAGE_LIMIT),
    page: String(page),
  });
  return {
    items: res.data,
    total: res.meta.total,
    page,
    hasMore: res.meta.hasMore,
  };
}

export class RateLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super("Rate limited");
    this.retryAfter = retryAfter;
  }
}
