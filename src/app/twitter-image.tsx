import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "SwipeMRR — Swipe through startups for sale. Discover MRR, pricing, and growth metrics at a glance.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #eff6ff 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Heart + Star icon */}
        <div style={{ display: "flex", marginBottom: 32 }}>
          <svg width="120" height="120" viewBox="0 0 512 512">
            <defs>
              <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>
            </defs>
            <path
              d="M256 448l-30-28C110 316 48 260 48 192 48 136 92 92 148 92c34 0 66 16 86 40h44c20-24 52-40 86-40 56 0 100 44 100 100 0 68-62 124-178 228l-30 28z"
              fill="url(#hg)"
            />
            <path
              d="M256 152l26 80h84l-68 50 26 80-68-50-68 50 26-80-68-50h84z"
              fill="white"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 4,
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 72, fontWeight: 800, color: "#0f172a" }}>
            Swipe
          </span>
          <span style={{ fontSize: 72, fontWeight: 800, color: "#16a34a" }}>
            MRR
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#64748b",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Swipe through startups for sale. Discover MRR, pricing, and growth
          metrics at a glance.
        </div>

        {/* Swipe hint pills */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              borderRadius: 999,
              border: "2px solid #fca5a5",
              color: "#ef4444",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            ← Pass
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              borderRadius: 999,
              border: "2px solid #86efac",
              color: "#16a34a",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Save →
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            color: "#94a3b8",
          }}
        >
          swipemrr.com · Data by TrustMRR
        </div>
      </div>
    ),
    { ...size },
  );
}
