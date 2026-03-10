"use client";

import Link from "next/link";

interface EmptyStateProps {
  savedCount: number;
  onRefresh: () => void;
}

export default function EmptyState({ savedCount, onRefresh }: EmptyStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-[0_4px_6px_rgba(0,0,0,0.07),0_20px_40px_rgba(0,0,0,0.1)]">
      <div className="mb-2 text-5xl">🎉</div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        You&apos;ve seen all available startups!
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        Check back later for new listings
      </p>
      <div className="flex gap-3">
        <Link
          href="/saved"
          className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          View Saved ({savedCount})
        </Link>
        <button
          onClick={onRefresh}
          className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Refresh Listings
        </button>
      </div>
    </div>
  );
}
