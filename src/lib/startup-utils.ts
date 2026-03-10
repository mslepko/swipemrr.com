// Keyed by lowercase category name as returned by the TrustMRR API
export const CATEGORY_COLORS: Record<string, string> = {
  "artificial intelligence": "bg-purple-100 text-purple-800",
  saas: "bg-blue-100 text-blue-800",
  "developer tools": "bg-gray-100 text-gray-800",
  fintech: "bg-green-100 text-green-800",
  marketing: "bg-orange-100 text-orange-800",
  "e-commerce": "bg-yellow-100 text-yellow-800",
  productivity: "bg-indigo-100 text-indigo-800",
  "design tools": "bg-pink-100 text-pink-800",
  "no-code": "bg-teal-100 text-teal-800",
  analytics: "bg-cyan-100 text-cyan-800",
  "crypto & web3": "bg-amber-100 text-amber-800",
  education: "bg-emerald-100 text-emerald-800",
  "health & fitness": "bg-rose-100 text-rose-800",
  "social media": "bg-violet-100 text-violet-800",
  "content creation": "bg-fuchsia-100 text-fuchsia-800",
  sales: "bg-lime-100 text-lime-800",
  "customer support": "bg-sky-100 text-sky-800",
  recruiting: "bg-stone-100 text-stone-800",
  "real estate": "bg-red-100 text-red-800",
  travel: "bg-blue-100 text-blue-800",
  legal: "bg-slate-100 text-slate-800",
  security: "bg-zinc-100 text-zinc-800",
  "iot & hardware": "bg-neutral-100 text-neutral-800",
  "green tech": "bg-green-100 text-green-800",
  entertainment: "bg-purple-100 text-purple-800",
  games: "bg-red-100 text-red-800",
  community: "bg-orange-100 text-orange-800",
  "news & magazines": "bg-gray-100 text-gray-800",
  utilities: "bg-teal-100 text-teal-800",
  marketplace: "bg-indigo-100 text-indigo-800",
  "mobile apps": "bg-cyan-100 text-cyan-800",
};

export function getCategoryColor(category: string | null | undefined): string {
  if (!category) return "bg-gray-100 text-gray-800";
  const lower = category.toLowerCase();
  return CATEGORY_COLORS[lower] || "bg-gray-100 text-gray-800";
}

export function getMultipleColor(multiple: number | undefined): string {
  if (multiple == null) return "text-gray-900";
  if (multiple < 1) return "text-green-600";
  if (multiple > 4) return "text-red-600";
  return "text-gray-900";
}
