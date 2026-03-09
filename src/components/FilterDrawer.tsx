"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filters } from "@/lib/types";

const CATEGORIES = [
  "Artificial Intelligence",
  "SaaS",
  "Developer Tools",
  "Fintech",
  "Marketing",
  "E-commerce",
  "Productivity",
  "Design Tools",
  "No-Code",
  "Analytics",
  "Education",
  "Health & Fitness",
  "Content Creation",
  "Sales",
  "Customer Support",
  "Real Estate",
  "Security",
  "Entertainment",
  "Marketplace",
  "Mobile Apps",
  "Community",
  "News & Magazines",
];

const MRR_PRESETS = [
  { label: "Any", min: undefined, max: undefined },
  { label: "$0–$1K", min: 0, max: 1000 },
  { label: "$1K–$10K", min: 1000, max: 10000 },
  { label: "$10K+", min: 10000, max: undefined },
];

const PRICE_PRESETS = [
  { label: "Any", min: undefined, max: undefined },
  { label: "Under $10K", min: 0, max: 10000 },
  { label: "$10K–$50K", min: 10000, max: 50000 },
  { label: "$50K–$500K", min: 50000, max: 500000 },
  { label: "$500K+", min: 500000, max: undefined },
];

interface FilterDrawerProps {
  open: boolean;
  filters: Filters;
  onApply: (filters: Filters) => void;
  onClose: () => void;
}

export default function FilterDrawer({
  open,
  filters,
  onApply,
  onClose,
}: FilterDrawerProps) {
  const [draft, setDraft] = useState<Filters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const handleReset = () => {
    setDraft({ sort: filters.sort });
  };

  const activeMrrPreset = MRR_PRESETS.findIndex(
    (p) => p.min === draft.minMrr && p.max === draft.maxMrr
  );

  const activePricePreset = PRICE_PRESETS.findIndex(
    (p) => p.min === draft.minPrice && p.max === draft.maxPrice
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[420px] rounded-t-2xl bg-white p-6 shadow-xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button
                onClick={handleReset}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Reset
              </button>
            </div>

            {/* Category */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    setDraft((d) => ({ ...d, category: undefined }))
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    !draft.category
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        category: d.category === cat ? undefined : cat,
                      }))
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      draft.category === cat
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* MRR Range */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                MRR Range
              </p>
              <div className="flex gap-2">
                {MRR_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        minMrr: preset.min,
                        maxMrr: preset.max,
                      }))
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeMrrPreset === i
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Asking Price */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                Asking Price
              </p>
              <div className="flex flex-wrap gap-2">
                {PRICE_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        minPrice: preset.min,
                        maxPrice: preset.max,
                      }))
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      activePricePreset === i
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Min Growth */}
            <div className="mb-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                Min 30d Growth
              </p>
              <div className="flex gap-2">
                {[
                  { label: "Any", value: undefined },
                  { label: "0%+", value: 0 },
                  { label: "10%+", value: 10 },
                  { label: "50%+", value: 50 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() =>
                      setDraft((d) => ({ ...d, minGrowth: opt.value }))
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      draft.minGrowth === opt.value
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onApply(draft)}
              className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Apply Filters
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
