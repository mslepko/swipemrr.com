"use client";

import { SavedStartup } from "@/lib/types";
import { formatCurrency } from "@/lib/storage";
import { getCategoryColor, getMultipleColor } from "@/lib/startup-utils";

interface SavedStartupCardProps {
  startup: SavedStartup;
  onRemove: (slug: string) => void;
}

export default function SavedStartupCard({
  startup,
  onRemove,
}: SavedStartupCardProps) {
  const categoryColor = getCategoryColor(startup.category);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_16px_rgba(0,0,0,0.08)]">
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {startup.logo ? (
            <img
              src={startup.logo}
              alt=""
              className="h-8 w-8 shrink-0 rounded-lg bg-gray-100 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const fallback = (e.target as HTMLImageElement)
                  .nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`${startup.logo ? "hidden" : "flex"} h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-400`}
          >
            {startup.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-base font-bold leading-tight text-gray-900">
              {startup.name}
            </h3>
            {startup.foundedDate && (
              <p className="text-xs text-gray-400">
                Founded {new Date(startup.foundedDate).getFullYear()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => onRemove(startup.slug)}
          className="ml-2 shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label={`Remove ${startup.name}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {startup.category && (
        <div className="mb-2">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor}`}
          >
            {startup.category}
          </span>
        </div>
      )}

      {startup.description && (
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
          {startup.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            MRR
          </p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(startup.mrr)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Asking Price
          </p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(startup.askingPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Multiple
          </p>
          <p
            className={`text-lg font-bold ${getMultipleColor(startup.multiple)}`}
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
            className={`text-lg font-bold ${startup.growth30d != null && startup.growth30d >= 0 ? "text-green-600" : startup.growth30d != null ? "text-red-600" : "text-gray-900"}`}
          >
            {startup.growth30d != null
              ? `${startup.growth30d >= 0 ? "+" : ""}${startup.growth30d.toFixed(1)}%`
              : "N/A"}
          </p>
        </div>
      </div>

      <a
        href={`https://trustmrr.com/startup/${startup.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block w-full rounded-xl bg-gray-900 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gray-800"
      >
        View on TrustMRR
      </a>
    </div>
  );
}
