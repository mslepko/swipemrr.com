"use client";

import { useEffect, useState } from "react";
import { SavedStartup, TrustMRRStartup } from "@/lib/types";
import { getSavedStartups, removeStartup } from "@/lib/storage";
import SavedStartupCard from "./SavedStartupCard";

export default function SavedList() {
  const [saved, setSaved] = useState<SavedStartup[]>([]);
  const [enriched, setEnriched] = useState<Map<string, TrustMRRStartup>>(
    new Map(),
  );

  useEffect(() => {
    setSaved(getSavedStartups());

    fetch("/api/startups/all")
      .then((res) => res.json())
      .then((json) => {
        const map = new Map<string, TrustMRRStartup>();
        for (const s of json.data) map.set(s.slug, s);
        setEnriched(map);
      })
      .catch(() => {});
  }, []);

  const handleRemove = (slug: string) => {
    removeStartup(slug);
    setSaved(getSavedStartups());
  };

  const displayList: SavedStartup[] = saved.map((s) => {
    const full = enriched.get(s.slug);
    if (!full) return s;
    return {
      ...s,
      name: full.name,
      category: full.category,
      description: full.description,
      logo: full.logo,
      foundedDate: full.foundedDate,
      mrr: full.mrr,
      askingPrice: full.askingPrice,
      multiple: full.multiple,
      growth30d: full.growth30d,
    };
  });

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
      {displayList.map((s) => (
        <SavedStartupCard key={s.slug} startup={s} onRemove={handleRemove} />
      ))}
    </div>
  );
}
