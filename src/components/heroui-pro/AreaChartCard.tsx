"use client";

import React from "react";
import { Card, Chip, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartDataPoint = {
  label: string;
  value: number;
};

interface AreaChartCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  data: ChartDataPoint[];
  height?: number;
  className?: string;
  formatTooltip?: (value: number) => string;
}

export function AreaChartCard({
  title,
  value,
  change,
  changeType,
  data,
  height = 200,
  className,
  formatTooltip,
}: AreaChartCardProps) {
  const color =
    changeType === "positive" ? "success" : changeType === "negative" ? "danger" : "default";

  const strokeColor =
    changeType === "positive" ? "#10b981" : changeType === "negative" ? "#ef4444" : "#737373";

  const defaultFormat = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toLocaleString()}`;

  const fmt = formatTooltip ?? defaultFormat;

  return (
    <Card className={cn("border border-default-200 bg-content1 overflow-hidden", className)}>
      <div className="flex items-start justify-between p-5 pb-2">
        <div className="flex flex-col gap-y-1">
          <span className="text-small text-default-500 font-medium">{title}</span>
          <span className="text-2xl font-semibold font-mono">{value}</span>
        </div>
        <Chip
          classNames={{ content: "font-semibold text-[0.65rem] font-mono" }}
          color={changeType === "positive" ? "success" : changeType === "negative" ? "danger" : "default"}
          radius="sm"
          size="sm"
          startContent={
            changeType === "positive" ? (
              <Icon height={12} icon="solar:arrow-right-up-linear" width={12} />
            ) : changeType === "negative" ? (
              <Icon height={12} icon="solar:arrow-right-down-linear" width={12} />
            ) : (
              <Icon height={12} icon="solar:arrow-right-linear" width={12} />
            )
          }
          variant="flat"
        >
          {change}
        </Chip>
      </div>
      <ResponsiveContainer
        className="[&_.recharts-surface]:outline-hidden"
        height={height}
        width="100%"
      >
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1a1a1a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            style={{ fontSize: "10px" }}
            tickLine={false}
            tick={{ fill: "#737373" }}
          />
          <YAxis hide />
          <Tooltip
            content={({ label, payload }) => {
              if (!payload?.length) return null;
              return (
                <div className="rounded-lg bg-content2 border border-default-200 px-3 py-2 shadow-lg">
                  <p className="text-foreground font-mono text-sm font-semibold">
                    {fmt(payload[0].value as number)}
                  </p>
                  <p className="text-default-500 text-xs">{label}</p>
                </div>
              );
            }}
            cursor={{ stroke: "#262626", strokeWidth: 1 }}
          />
          <Area
            activeDot={{ stroke: strokeColor, strokeWidth: 2, fill: "#0a0a0a", r: 4 }}
            animationDuration={800}
            dataKey="value"
            fill={`url(#gradient-${color})`}
            stroke={strokeColor}
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
