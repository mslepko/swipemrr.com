"use client";

interface FooterProps {
  fetchedAt?: number;
}

function formatRefreshed(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Footer({ fetchedAt }: FooterProps) {
  return (
    <footer className="mt-3 shrink-0 border-t border-gray-100 pt-2 pb-1">
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <div>
          Data by{" "}
          <a
            href="https://trustmrr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 underline decoration-dotted"
          >
            TrustMRR
          </a>
          {fetchedAt && (
            <span className="ml-1">
              (refreshed {formatRefreshed(fetchedAt)})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          Built with ☕ by{" "}
          <a
            href="https://michalslepko.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 underline decoration-dotted"
          >
            Michal
          </a>
          <a
            href="https://x.com/michal_codes"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 transition-colors hover:text-gray-700"
            aria-label="Follow on X"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
