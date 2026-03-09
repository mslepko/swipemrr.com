export interface TrustMRRStartup {
  name: string;
  slug: string;
  category: string;
  description: string;
  currentMrr?: number;
  currentTotalRevenue?: number;
  currentLast30DaysRevenue?: number;
  momGrowth?: number;
  onSale: boolean;
  askingPrice?: number;
  revenueMultiple?: number;
  logo?: string;
  foundedYear?: number;
  techStack?: string[];
  customers?: number;
  churnRate?: number;
}

export interface SavedStartup {
  slug: string;
  name: string;
  category: string;
  currentMrr?: number;
  askingPrice?: number;
  revenueMultiple?: number;
  savedAt: string;
}

export interface CachedData {
  startups: TrustMRRStartup[];
  cachedAt: number;
  page: number;
  hasMore: boolean;
}

export interface ApiResponse {
  data: TrustMRRStartup[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
