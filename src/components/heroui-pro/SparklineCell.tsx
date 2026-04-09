"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SparklineCellProps {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

export function SparklineCell({ data, positive, width = 80, height = 32 }: SparklineCellProps) {
  const color = positive ? "#10b981" : "#ef4444";
  const chartData = data.map((v, i) => ({ v, i }));

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${positive ? "up" : "down"}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${positive ? "up" : "down"})`}
            animationDuration={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
