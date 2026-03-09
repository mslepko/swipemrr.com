import { SavedStartup, TrustMRRStartup, CachedData } from "./types";

const SAVED_KEY = "swipemrr_saved";
const CACHE_KEY = "swipemrr_cache_v2";
const SEEN_KEY = "swipemrr_seen";
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

// Clean up old cache keys from previous versions
if (typeof window !== "undefined") {
  localStorage.removeItem("swipemrr_cache");
}

export function getSavedStartups(): SavedStartup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStartup(startup: TrustMRRStartup): void {
  const saved = getSavedStartups();
  if (saved.some((s) => s.slug === startup.slug)) return;
  saved.push({
    slug: startup.slug,
    name: startup.name,
    category: startup.category,
    mrr: startup.mrr,
    askingPrice: startup.askingPrice,
    multiple: startup.multiple,
    savedAt: new Date().toISOString(),
  });
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
}

export function removeStartup(slug: string): void {
  const saved = getSavedStartups().filter((s) => s.slug !== slug);
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
}

export function getCachedData(): CachedData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedData = JSON.parse(raw);
    if (Date.now() - cached.cachedAt > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

export function setCachedData(data: CachedData): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

export function clearCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(SEEN_KEY);
}

export function getSeenSlugs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function addSeenSlug(slug: string): void {
  const seen = getSeenSlugs();
  seen.add(slug);
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
}

export function formatCurrency(dollars: number | undefined | null): string {
  if (dollars == null) return "N/A";
  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(1)}M`;
  }
  if (dollars >= 1_000) {
    return `$${(dollars / 1_000).toFixed(1)}K`;
  }
  return `$${dollars.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
