"use client";

import { TrustMRRStartup } from "@/lib/types";
import { formatCurrency, saveStartup, getSavedStartups } from "@/lib/storage";
import MrrSparkline from "./MrrSparkline";
import { useState } from "react";

interface DigestListProps {
  startups: TrustMRRStartup[];
}

export default function DigestList({ startups }: DigestListProps) {
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(() => {
    const saved = getSavedStartups();
    return new Set(saved.map((s) => s.slug));
  });

  const handleSave = (startup: TrustMRRStartup) => {
    saveStartup(startup);
    setSavedSlugs((prev) => new Set([...prev, startup.slug]));
  };

  if (startups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-4xl">📭</p>
        <p className="mt-2 text-sm text-gray-500">No new listings today</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {startups.map((startup) => {
        const isSaved = savedSlugs.has(startup.slug);
        return (
          <div
            key={startup.slug}
            className="rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                {startup.logo ? (
                  <img
                    src={startup.logo}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-lg bg-gray-100 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-400">
                    {startup.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {startup.name}
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    {startup.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSave(startup)}
                disabled={isSaved}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isSaved
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>

            <p className="mb-3 line-clamp-2 text-xs text-gray-500">
              {startup.description}
            </p>

            {startup.mrr != null && startup.growth30d != null && (
              <MrrSparkline mrr={startup.mrr} growth30d={startup.growth30d} />
            )}

            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-gray-400">MRR </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(startup.mrr)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Price </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(startup.askingPrice)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Multiple </span>
                <span className="font-semibold text-gray-900">
                  {startup.multiple != null
                    ? `${startup.multiple.toFixed(1)}x`
                    : "N/A"}
                </span>
              </div>
            </div>

            <a
              href={`https://trustmrr.com/startup/${startup.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center text-xs font-medium text-gray-400 hover:text-gray-600"
            >
              View on TrustMRR →
            </a>
          </div>
        );
      })}
    </div>
  );
}
