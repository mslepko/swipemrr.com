"use client";

import { TrustMRRStartup } from "@/lib/types";
import { formatCurrency } from "@/lib/storage";

// Keyed by lowercase category name as returned by the TrustMRR API
const CATEGORY_COLORS: Record<string, string> = {
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

function getCategoryColor(category: string): string {
  const lower = category.toLowerCase();
  return CATEGORY_COLORS[lower] || "bg-gray-100 text-gray-800";
}

function getMultipleColor(multiple: number | undefined): string {
  if (multiple == null) return "text-gray-900";
  if (multiple < 1) return "text-green-600";
  if (multiple > 4) return "text-red-600";
  return "text-gray-900";
}

interface StartupCardProps {
  startup: TrustMRRStartup;
}

export default function StartupCard({ startup }: StartupCardProps) {
  const categoryColor = getCategoryColor(startup.category);

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_4px_6px_rgba(0,0,0,0.07),0_20px_40px_rgba(0,0,0,0.1)]">
      <div>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {startup.logo ? (
              <img
                src={startup.logo}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-400">
                {startup.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold leading-tight text-gray-900">
                {startup.name}
              </h2>
              {startup.foundedDate && (
                <p className="text-xs text-gray-400">
                  Founded{" "}
                  {new Date(startup.foundedDate).getFullYear()}
                </p>
              )}
            </div>
          </div>
          <span
            className={`ml-2 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${categoryColor}`}
          >
            {startup.category}
          </span>
        </div>

        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-gray-600">
          {startup.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              MRR
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(startup.mrr)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Asking Price
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(startup.askingPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Multiple
            </p>
            <p
              className={`text-2xl font-bold ${getMultipleColor(startup.multiple)}`}
            >
              {startup.multiple != null
                ? `${startup.multiple.toFixed(1)}x`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              30d Growth
            </p>
            <p
              className={`text-2xl font-bold ${startup.growth30d != null && startup.growth30d >= 0 ? "text-green-600" : startup.growth30d != null ? "text-red-600" : "text-gray-900"}`}
            >
              {startup.growth30d != null
                ? `${startup.growth30d >= 0 ? "+" : ""}${startup.growth30d.toFixed(1)}%`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <a
        href={`https://trustmrr.com/startup/${startup.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 block w-full rounded-xl bg-gray-900 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-gray-800"
      >
        View on TrustMRR
      </a>
    </div>
  );
}
