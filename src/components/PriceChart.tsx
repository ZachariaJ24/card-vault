"use client";

import { useMemo } from "react";
import type { MockPricePoint } from "@/lib/types";

interface Props {
  data: MockPricePoint[];
  height?: number;
  color?: string;
}

export default function PriceChart({ data, height = 120, color = "#3b82f6" }: Props) {
  const { points, minPrice, maxPrice, isPositive } = useMemo(() => {
    if (!data.length) return { points: "", minPrice: 0, maxPrice: 0, isPositive: true };
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const w = 600;
    const h = height;
    const pad = 8;

    const coords = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
      const y = h - pad - ((d.price - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    });

    const first = data[0].price;
    const last = data[data.length - 1].price;

    return {
      points: coords.join(" "),
      minPrice: min,
      maxPrice: max,
      isPositive: last >= first,
    };
  }, [data, height]);

  const lineColor = color === "auto" ? (isPositive ? "#22c55e" : "#ef4444") : color;
  const fillId = `grad-${lineColor.replace("#", "")}`;

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-24 text-default-400 text-sm">
        No price data available
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 600 ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={`8,${height} ${points} ${592},${height}`}
          fill={`url(#${fillId})`}
          stroke="none"
        />
        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex justify-between text-xs text-default-400 mt-1 px-1">
        <span>${minPrice.toLocaleString()}</span>
        <span>${maxPrice.toLocaleString()}</span>
      </div>
    </div>
  );
}
