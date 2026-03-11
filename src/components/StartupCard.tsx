"use client";

import { useRef } from "react";
import { TrustMRRStartup } from "@/lib/types";
import { formatCurrency } from "@/lib/storage";
import { getCategoryColor, getMultipleColor } from "@/lib/startup-utils";
import MrrSparkline from "./MrrSparkline";
import ShareButton from "./ShareButton";

interface StartupCardProps {
  startup: TrustMRRStartup;
}

export default function StartupCard({ startup }: StartupCardProps) {
  const categoryColor = getCategoryColor(startup.category);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={cardRef} className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-[0_4px_6px_rgba(0,0,0,0.07),0_20px_40px_rgba(0,0,0,0.1)]">
      <ShareButton cardRef={cardRef} startup={startup} />
      <div className="min-h-0 flex-1 overflow-y-auto" style={{ touchAction: "pan-y" }}>
        <div className="mb-1 flex items-center gap-3 pr-10">
          {startup.logo ? (
            <img
              src={startup.logo}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-400">
              {startup.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold leading-tight text-gray-900">
              {startup.name}
            </h2>
            {startup.foundedDate && (
              <p className="text-xs text-gray-400">
                Founded{" "}
                {new Date(startup.foundedDate).getFullYear()}
              </p>
            )}
          </div>
        </div>
        {startup.category && (
          <div className="mb-3">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColor}`}
            >
              {startup.category}
            </span>
          </div>
        )}

        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-gray-600">
          {startup.description}
        </p>

        {startup.mrr != null && startup.mrr > 0 && startup.growth30d != null && (
          <MrrSparkline mrr={startup.mrr} growth30d={startup.growth30d} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              MRR
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(startup.mrr)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Asking Price
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(startup.askingPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Multiple
            </p>
            <p
              className={`text-2xl font-bold ${getMultipleColor(startup.multiple)}`}
            >
              {startup.multiple != null
                ? `${startup.multiple.toFixed(1)}x`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              30d Growth
            </p>
            <p
              className={`text-2xl font-bold ${startup.growth30d != null && startup.growth30d >= 0 ? "text-green-600" : startup.growth30d != null ? "text-red-600" : "text-gray-900"}`}
            >
              {startup.growth30d != null
                ? `${startup.growth30d >= 0 ? "+" : ""}${startup.growth30d.toFixed(1)}%`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <a
        href={`https://trustmrr.com/startup/${startup.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 block w-full shrink-0 rounded-xl bg-gray-900 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-gray-800"
      >
        View on TrustMRR
      </a>
    </div>
  );
}
