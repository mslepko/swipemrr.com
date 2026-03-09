"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import CardStack from "@/components/CardStack";
import FilterDrawer from "@/components/FilterDrawer";
import Footer from "@/components/Footer";
import { getSavedStartups } from "@/lib/storage";
import { Filters } from "@/lib/types";

export default function Home() {
  const [savedCount, setSavedCount] = useState(0);
  const [filters, setFilters] = useState<Filters>({ sort: "best-deal" });
  const [fetchedAt, setFetchedAt] = useState<number>();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSavedCount(getSavedStartups().length);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSavedCount(getSavedStartups().length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeFilterCount = [
    filters.category,
    filters.minMrr,
    filters.maxMrr,
    filters.minPrice,
    filters.maxPrice,
    filters.minGrowth,
  ].filter((v) => v != null).length;

  const handleToggleSort = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      sort: prev.sort === "best-deal" ? "multiple-asc" : "best-deal",
    }));
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-[420px] flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Swipe<span className="text-green-600">MRR</span>
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/digest"
            className="flex items-center justify-center rounded-full bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Daily Digest"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link
            href="/saved"
            className="relative flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-red-400"
            >
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.723.723 0 01-.698 0l-.002-.001z" />
            </svg>
            Saved
            {savedCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1.5 text-xs font-bold text-white">
                {savedCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={handleToggleSort}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filters.sort === "multiple-asc"
              ? "bg-orange-100 text-orange-800"
              : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          }`}
        >
          {filters.sort === "multiple-asc" ? "🔥 Hot Deals" : "Best Deal"}
        </button>
        <button
          onClick={() => setShowFilters(true)}
          className="relative rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <main className="flex-1">
        <CardStack filters={filters} onFetchedAt={setFetchedAt} />
      </main>

      <Footer fetchedAt={fetchedAt} />

      <FilterDrawer
        open={showFilters}
        filters={filters}
        onApply={(f) => {
          setFilters(f);
          setShowFilters(false);
        }}
        onClose={() => setShowFilters(false)}
      />
    </div>
  );
}
