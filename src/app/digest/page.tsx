"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DigestList from "@/components/DigestList";
import { TrustMRRStartup, ApiResponse } from "@/lib/types";

const DIGEST_CACHE_KEY = "swipemrr_digest";
const DIGEST_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface DigestCache {
  startups: TrustMRRStartup[];
  cachedAt: number;
}

function getCachedDigest(): DigestCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DIGEST_CACHE_KEY);
    if (!raw) return null;
    const cached: DigestCache = JSON.parse(raw);
    if (Date.now() - cached.cachedAt > DIGEST_TTL) {
      localStorage.removeItem(DIGEST_CACHE_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

export default function DigestPage() {
  const [startups, setStartups] = useState<TrustMRRStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCachedDigest();
    if (cached) {
      setStartups(cached.startups);
      setLoading(false);
      return;
    }

    async function fetchDigest() {
      try {
        const res = await fetch(
          "/api/startups?onSale=true&sort=listed-desc&limit=10"
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data: ApiResponse = await res.json();
        setStartups(data.data);
        localStorage.setItem(
          DIGEST_CACHE_KEY,
          JSON.stringify({ startups: data.data, cachedAt: Date.now() })
        );
      } catch {
        setError("Failed to load digest. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDigest();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-[420px] flex-col px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Daily Digest</h1>
        <div className="w-12" />
      </header>

      <p className="mb-4 text-center text-xs text-gray-400">{today}</p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-white shadow-sm"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      ) : (
        <DigestList startups={startups} />
      )}
    </div>
  );
}
