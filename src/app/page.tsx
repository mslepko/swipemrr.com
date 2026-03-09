"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CardStack from "@/components/CardStack";
import { getSavedStartups } from "@/lib/storage";

export default function Home() {
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    setSavedCount(getSavedStartups().length);
  }, []);

  // Poll for saved count changes (storage events don't fire in same tab)
  useEffect(() => {
    const interval = setInterval(() => {
      setSavedCount(getSavedStartups().length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-[420px] flex-col px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Swipe<span className="text-green-600">MRR</span>
        </h1>
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
      </header>

      <main className="flex-1">
        <CardStack />
      </main>
    </div>
  );
}
