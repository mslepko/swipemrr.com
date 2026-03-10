"use client";

import Link from "next/link";
import SavedList from "@/components/SavedList";

export default function SavedPage() {
  return (
    <div className="mx-auto flex h-dvh max-w-[420px] flex-col overflow-y-auto px-4 py-6">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
          aria-label="Back to swipe"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-gray-700"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Saved Startups
        </h1>
      </header>

      <main className="flex-1">
        <SavedList />
      </main>
    </div>
  );
}
