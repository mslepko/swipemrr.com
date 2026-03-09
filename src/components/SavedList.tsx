"use client";

import { useEffect, useState } from "react";
import { SavedStartup } from "@/lib/types";
import { getSavedStartups, removeStartup, formatCurrency } from "@/lib/storage";

export default function SavedList() {
  const [saved, setSaved] = useState<SavedStartup[]>([]);

  useEffect(() => {
    setSaved(getSavedStartups());
  }, []);

  const handleRemove = (slug: string) => {
    removeStartup(slug);
    setSaved(getSavedStartups());
  };

  if (saved.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-[0_4px_6px_rgba(0,0,0,0.07),0_20px_40px_rgba(0,0,0,0.1)]">
        <div className="mb-2 text-4xl">💔</div>
        <h2 className="mb-1 text-lg font-bold text-gray-900">
          No saved startups yet
        </h2>
        <p className="text-sm text-gray-500">
          Swipe right on startups you like to save them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {saved.map((s) => (
        <div
          key={s.slug}
          className="rounded-2xl bg-white p-4 shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_16px_rgba(0,0,0,0.08)]"
        >
          <div className="mb-2 flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900">{s.name}</h3>
              <span className="text-xs text-gray-500">
                {s.category
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </span>
            </div>
            <button
              onClick={() => handleRemove(s.slug)}
              className="ml-2 shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label={`Remove ${s.name}`}
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
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-gray-400">MRR </span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(s.currentMrr)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Price </span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(s.askingPrice)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Multiple </span>
              <span
                className={`font-semibold ${s.revenueMultiple != null && s.revenueMultiple < 1 ? "text-green-600" : s.revenueMultiple != null && s.revenueMultiple > 4 ? "text-red-600" : "text-gray-900"}`}
              >
                {s.revenueMultiple != null ? `${s.revenueMultiple.toFixed(1)}x` : "N/A"}
              </span>
            </div>
          </div>
          <a
            href={`https://trustmrr.com/startup/${s.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block w-full rounded-xl bg-gray-900 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            View on TrustMRR
          </a>
        </div>
      ))}
    </div>
  );
}
