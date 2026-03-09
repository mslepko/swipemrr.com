"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from "framer-motion";
import {
  TrustMRRStartup,
  ApiResponse,
  SwipeHistoryEntry,
  Filters,
} from "@/lib/types";
import {
  saveStartup,
  removeStartup,
  addSeenSlug,
  removeSeenSlug,
  getCachedData,
  setCachedData,
  clearCache,
  getSeenSlugs,
  getSavedStartups,
} from "@/lib/storage";
import StartupCard from "./StartupCard";
import EmptyState from "./EmptyState";

const SWIPE_THRESHOLD = 120;
const FLY_DISTANCE = 600;
const MAX_UNDO_HISTORY = 10;

interface CardStackProps {
  filters?: Filters;
}

export default function CardStack({ filters }: CardStackProps) {
  const [startups, setStartups] = useState<TrustMRRStartup[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [savedCount, setSavedCount] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistoryEntry[]>([]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const saveOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

  const startupsRef = useRef(startups);
  startupsRef.current = startups;

  const buildUrl = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams({
        onSale: "true",
        limit: "50",
        page: String(pageNum),
        sort: filters?.sort || "best-deal",
      });
      if (filters?.category) params.set("category", filters.category);
      if (filters?.minMrr != null)
        params.set("minMrr", String(filters.minMrr));
      if (filters?.maxMrr != null)
        params.set("maxMrr", String(filters.maxMrr));
      if (filters?.minPrice != null)
        params.set("minPrice", String(filters.minPrice));
      if (filters?.maxPrice != null)
        params.set("maxPrice", String(filters.maxPrice));
      if (filters?.minGrowth != null)
        params.set("minGrowth", String(filters.minGrowth));
      return `/api/startups?${params.toString()}`;
    },
    [filters]
  );

  const fetchData = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(buildUrl(pageNum));
        if (res.status === 429) {
          setError("Too many requests, please wait a moment");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data: ApiResponse = await res.json();

        const seen = getSeenSlugs();
        let newStartups = data.data.filter((s) => !seen.has(s.slug));

        // Filter out startups with no MRR or no multiple in Hot Deals mode
        if (filters?.sort === "multiple-asc") {
          newStartups = newStartups.filter(
            (s) => s.mrr != null && s.mrr > 0 && s.multiple != null
          );
        }

        if (append) {
          setStartups((prev) => {
            const combined = [...prev, ...newStartups];
            setCachedData({
              startups: combined,
              cachedAt: Date.now(),
              page: data.meta.page,
              hasMore: data.meta.hasMore,
            });
            return combined;
          });
        } else {
          setStartups(newStartups);
          setCurrentIndex(0);
          setCachedData({
            startups: newStartups,
            cachedAt: Date.now(),
            page: data.meta.page,
            hasMore: data.meta.hasMore,
          });
        }
        setHasMore(data.meta.hasMore);
        setPage(data.meta.page);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [buildUrl]
  );

  // Refetch when filters change
  useEffect(() => {
    clearCache();
    setSwipeHistory([]);
    fetchData(1);
    setSavedCount(getSavedStartups().length);
  }, [fetchData]);

  const advanceCard = useCallback(
    (direction: "left" | "right") => {
      const current = startupsRef.current[currentIndex];
      if (!current) return;

      setSwipeHistory((prev) => [
        ...prev.slice(-MAX_UNDO_HISTORY + 1),
        { slug: current.slug, direction, index: currentIndex },
      ]);

      addSeenSlug(current.slug);

      if (direction === "right") {
        saveStartup(current);
        setSavedCount(getSavedStartups().length);
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex >= startupsRef.current.length - 5 && hasMore) {
        fetchData(page + 1, true);
      }
    },
    [currentIndex, hasMore, page, fetchData]
  );

  const handleSwipe = useCallback(
    async (direction: "left" | "right") => {
      if (swiping) return;
      setSwiping(true);

      const targetX = direction === "right" ? FLY_DISTANCE : -FLY_DISTANCE;

      await animate(x, targetX, {
        type: "tween",
        duration: 0.3,
        ease: "easeOut",
      });

      advanceCard(direction);
      x.jump(0);
      setSwiping(false);
    },
    [swiping, x, advanceCard]
  );

  const handleUndo = useCallback(() => {
    if (swiping || swipeHistory.length === 0) return;

    const last = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory((prev) => prev.slice(0, -1));

    removeSeenSlug(last.slug);

    if (last.direction === "right") {
      removeStartup(last.slug);
      setSavedCount(getSavedStartups().length);
    }

    setCurrentIndex(last.index);
  }, [swiping, swipeHistory]);

  const handleDragEnd = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (swiping) return;

      if (info.offset.x > SWIPE_THRESHOLD) {
        setSwiping(true);
        await animate(x, FLY_DISTANCE, {
          type: "tween",
          duration: 0.2,
          ease: "easeOut",
        });
        advanceCard("right");
        x.jump(0);
        setSwiping(false);
      } else if (info.offset.x < -SWIPE_THRESHOLD) {
        setSwiping(true);
        await animate(x, -FLY_DISTANCE, {
          type: "tween",
          duration: 0.2,
          ease: "easeOut",
        });
        advanceCard("left");
        x.jump(0);
        setSwiping(false);
      } else {
        animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      }
    },
    [swiping, x, advanceCard]
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (swiping) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSwipe("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSwipe("right");
      } else if (
        e.key === "z" &&
        !e.ctrlKey &&
        !e.metaKey &&
        swipeHistory.length > 0
      ) {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [swiping, handleSwipe, handleUndo, swipeHistory.length]);

  const handleRefresh = useCallback(() => {
    clearCache();
    setStartups([]);
    setCurrentIndex(0);
    setSwipeHistory([]);
    fetchData(1);
  }, [fetchData]);

  if (loading && startups.length === 0) {
    return <SkeletonCard />;
  }

  if (error) {
    return (
      <div className="flex h-[480px] w-full flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-[0_4px_6px_rgba(0,0,0,0.07),0_20px_40px_rgba(0,0,0,0.1)]">
        <div className="mb-2 text-4xl">😕</div>
        <p className="mb-4 text-center text-sm text-gray-600">{error}</p>
        <button
          onClick={handleRefresh}
          className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  const remaining = startups.slice(currentIndex);

  if (remaining.length === 0) {
    return <EmptyState savedCount={savedCount} onRefresh={handleRefresh} />;
  }

  return (
    <div>
      <div className="relative h-[480px] w-full">
        {remaining
          .slice(0, 3)
          .reverse()
          .map((startup, reverseI) => {
            const i = Math.min(2, remaining.length - 1) - reverseI;
            const isTop = i === 0;
            return (
              <motion.div
                key={startup.slug}
                className="absolute inset-0"
                style={{
                  zIndex: 3 - i,
                  ...(isTop ? { x, rotate } : {}),
                }}
                animate={{
                  scale: 1 - i * 0.05,
                  y: i * 8,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                drag={isTop && !swiping ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={isTop ? handleDragEnd : undefined}
              >
                {isTop && (
                  <>
                    <motion.div
                      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-green-500/20"
                      style={{ opacity: saveOpacity }}
                    >
                      <span className="rounded-lg border-4 border-green-500 px-6 py-2 text-4xl font-black text-green-500">
                        SAVE
                      </span>
                    </motion.div>
                    <motion.div
                      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-red-500/20"
                      style={{ opacity: skipOpacity }}
                    >
                      <span className="rounded-lg border-4 border-red-500 px-6 py-2 text-4xl font-black text-red-500">
                        SKIP
                      </span>
                    </motion.div>
                  </>
                )}
                <StartupCard startup={startup} />
              </motion.div>
            );
          })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={() => handleSwipe("left")}
          disabled={swiping}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 text-red-400 shadow-md transition-all hover:border-red-400 hover:bg-red-50 hover:text-red-500 active:scale-95 disabled:opacity-50"
          aria-label="Skip"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L10.94 12l-5.72 5.72a.75.75 0 101.06 1.06L12 13.06l5.72 5.72a.75.75 0 101.06-1.06L13.06 12l5.72-5.72a.75.75 0 00-1.06-1.06L12 10.94 6.28 5.22z" />
          </svg>
        </button>

        {swipeHistory.length > 0 && (
          <button
            onClick={handleUndo}
            disabled={swiping}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-600 active:scale-95 disabled:opacity-50"
            aria-label="Undo last swipe"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M9.53 2.47a.75.75 0 010 1.06L4.81 8.25H15a6.75 6.75 0 010 13.5h-3a.75.75 0 010-1.5h3a5.25 5.25 0 100-10.5H4.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        <button
          onClick={() => handleSwipe("right")}
          disabled={swiping}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-200 text-green-400 shadow-md transition-all hover:border-green-400 hover:bg-green-50 hover:text-green-500 active:scale-95 disabled:opacity-50"
          aria-label="Save"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-gray-400">
        Swipe, tap, or use ← → keys
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div>
      <div className="h-[480px] w-full animate-pulse rounded-2xl bg-white p-6 shadow-[0_4px_6px_rgba(0,0,0,0.07),0_20px_40px_rgba(0,0,0,0.1)]">
        <div className="mb-3 flex items-start justify-between">
          <div className="h-7 w-40 rounded bg-gray-200" />
          <div className="h-6 w-20 rounded-full bg-gray-200" />
        </div>
        <div className="mb-5 space-y-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="mb-1 h-3 w-12 rounded bg-gray-200" />
              <div className="h-8 w-24 rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="mt-auto pt-8">
          <div className="h-12 w-full rounded-xl bg-gray-200" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-8">
        <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
        <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
