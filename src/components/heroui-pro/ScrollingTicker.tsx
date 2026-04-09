"use client";

import { cn } from "@heroui/react";
import { Icon } from "@iconify/react";

export type TickerItem = {
  name: string;
  price: string;
  change: string;
  up: boolean;
};

interface ScrollingTickerProps {
  items: TickerItem[];
  className?: string;
}

export function ScrollingTicker({ items, className }: ScrollingTickerProps) {
  const doubled = [...items, ...items];

  return (
    <div className={cn("h-9 overflow-hidden flex items-center bg-content1 border-b border-default-200", className)}>
      <div className="animate-ticker flex whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-4 text-xs">
            <span className="text-default-500">{item.name}</span>
            <span className="text-foreground font-mono font-semibold">{item.price}</span>
            <span className={cn("font-mono font-medium flex items-center gap-0.5", item.up ? "text-success" : "text-danger")}>
              <Icon
                icon={item.up ? "solar:arrow-right-up-linear" : "solar:arrow-right-down-linear"}
                width={10}
              />
              {item.change}
            </span>
            <span className="text-default-300 ml-2">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
