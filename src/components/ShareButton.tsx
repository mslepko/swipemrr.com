"use client";

import { useCallback, useState } from "react";
import { toPng } from "html-to-image";
import { TrustMRRStartup } from "@/lib/types";
import { formatCurrency } from "@/lib/storage";

interface ShareButtonProps {
  cardRef: React.RefObject<HTMLElement | null>;
  startup: TrustMRRStartup;
}

export default function ShareButton({ cardRef, startup }: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (!cardRef.current || sharing) return;
    setSharing(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${startup.slug}.png`, {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${startup.name} — ${formatCurrency(startup.askingPrice)}`,
          text: `Check out ${startup.name} on SwipeMRR`,
          files: [file],
        });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${startup.slug}.png`;
        a.click();
      }
    } catch {
      // User cancelled share or error occurred
    } finally {
      setSharing(false);
    }
  }, [cardRef, startup, sharing]);

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-400 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-gray-600 disabled:opacity-50"
      aria-label="Share card"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .799l6.733 3.366a2.5 2.5 0 11-.671 1.341l-6.733-3.366a2.5 2.5 0 110-3.483l6.733-3.366A2.52 2.52 0 0113 4.5z" />
      </svg>
    </button>
  );
}
