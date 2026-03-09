"use client";

interface MrrSparklineProps {
  mrr: number;
  growth30d: number;
}

function generateTrend(currentMrr: number, growth30d: number): number[] {
  const monthlyGrowth = 1 + growth30d / 100;
  const points = [currentMrr];
  for (let i = 1; i < 6; i++) {
    points.unshift(currentMrr / Math.pow(monthlyGrowth, i));
  }
  return points;
}

export default function MrrSparkline({ mrr, growth30d }: MrrSparklineProps) {
  const points = generateTrend(mrr, growth30d);
  const isPositive = growth30d >= 0;

  const width = 280;
  const height = 60;
  const padding = 4;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((val, i) => ({
    x: padding + (i / (points.length - 1)) * (width - padding * 2),
    y: padding + (1 - (val - min) / range) * (height - padding * 2),
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x},${height} L${coords[0].x},${height} Z`;

  const strokeColor = isPositive ? "#22c55e" : "#ef4444";
  const fillId = isPositive ? "sparkGreen" : "sparkRed";
  const gradientColor = isPositive ? "#22c55e" : "#ef4444";

  return (
    <div className="mb-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: 60 }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={gradientColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${fillId})`} />
        <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="mt-0.5 text-center text-[10px] text-gray-300">(estimated trend)</p>
    </div>
  );
}
