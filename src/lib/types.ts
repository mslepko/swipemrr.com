export interface TrustMRRStartup {
  name: string;
  slug: string;
  category: string;
  description: string;
  mrr?: number;
  totalRevenue?: number;
  last30DaysRevenue?: number;
  growth30d?: number;
  onSale: boolean;
  askingPrice?: number;
  multiple?: number;
  logo?: string;
  foundedDate?: string;
  techStack?: string[];
  customers?: number;
  churnRate?: number;
}

export interface SavedStartup {
  slug: string;
  name: string;
  category: string;
  mrr?: number;
  askingPrice?: number;
  multiple?: number;
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

export interface SwipeHistoryEntry {
  slug: string;
  direction: "left" | "right";
  index: number;
}

export interface Filters {
  category?: string;
  minMrr?: number;
  maxMrr?: number;
  minPrice?: number;
  maxPrice?: number;
  minGrowth?: number;
  sort?: string;
}

// Raw shape from the TrustMRR API (used for normalization in the proxy route)
export interface RawTrustMRRStartup {
  name: string;
  slug: string;
  url?: string;
  icon?: string;
  description: string;
  website?: string;
  country?: string;
  foundedDate?: string;
  category: string;
  paymentProvider?: string;
  targetAudience?: string;
  revenue?: {
    last30Days?: number;
    mrr?: number;
    total?: number;
  };
  customers?: number;
  activeSubscriptions?: number;
  askingPrice?: number;
  profitMarginLast30Days?: number;
  growth30d?: number;
  multiple?: number;
  onSale: boolean;
  firstListedForSaleAt?: string;
  xHandle?: string;
}
