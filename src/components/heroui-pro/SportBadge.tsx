"use client";

import { cn } from "@heroui/react";

const SPORT_CONFIG: Record<string, { tag: string; color: string; bg: string }> = {
  Hockey:     { tag: "NHL",  color: "text-blue-400",   bg: "bg-blue-500/10" },
  Baseball:   { tag: "MLB",  color: "text-red-400",    bg: "bg-red-500/10" },
  Basketball: { tag: "NBA",  color: "text-orange-400", bg: "bg-orange-500/10" },
  Football:   { tag: "NFL",  color: "text-emerald-400", bg: "bg-emerald-500/10" },
  Soccer:     { tag: "FIFA", color: "text-green-400",  bg: "bg-green-500/10" },
  Pokemon:    { tag: "TCG",  color: "text-yellow-400", bg: "bg-yellow-500/10" },
  Magic:      { tag: "MTG",  color: "text-purple-400", bg: "bg-purple-500/10" },
};

const FALLBACK = { tag: "OTH", color: "text-default-400", bg: "bg-default-100" };

interface SportBadgeProps {
  sport: string | null;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function SportBadge({ sport, size = "sm", className }: SportBadgeProps) {
  const cfg = SPORT_CONFIG[sport ?? ""] ?? FALLBACK;

  const sizeClasses = {
    xs: "text-[0.5rem] px-1 py-px leading-tight",
    sm: "text-[0.6rem] px-1.5 py-0.5",
    md: "text-[0.65rem] px-2 py-0.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded font-mono font-bold tracking-wider shrink-0",
        cfg.color,
        cfg.bg,
        sizeClasses[size],
        className,
      )}
    >
      {cfg.tag}
    </span>
  );
}

/** Returns just the tag text for use in plain strings */
export function sportTag(sport: string | null): string {
  return (SPORT_CONFIG[sport ?? ""] ?? FALLBACK).tag;
}
