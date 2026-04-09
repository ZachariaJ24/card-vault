"use client";

import { Card, Chip, cn } from "@heroui/react";
import { Icon } from "@iconify/react";

export type KpiCardProps = {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "neutral" | "negative";
  icon?: string;
  className?: string;
};

export function KpiCard({ title, value, change, changeType, icon, className }: KpiCardProps) {
  return (
    <Card className={cn("border border-default-200 bg-content1", className)}>
      <div className="flex p-4">
        {icon && (
          <div
            className={cn("mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md", {
              "bg-success-50 dark:bg-success-500/10": changeType === "positive",
              "bg-warning-50 dark:bg-warning-500/10": changeType === "neutral",
              "bg-danger-50 dark:bg-danger-500/10": changeType === "negative",
            })}
          >
            <Icon
              className={cn({
                "text-success": changeType === "positive",
                "text-warning": changeType === "neutral",
                "text-danger": changeType === "negative",
              })}
              icon={icon}
              width={20}
            />
          </div>
        )}

        <div className={cn("flex flex-col gap-y-1", icon && "ml-3")}>
          <dt className="text-small text-default-500 font-medium">{title}</dt>
          <dd className="text-2xl font-semibold font-mono">{value}</dd>
        </div>

        <Chip
          className="absolute right-4 top-4"
          classNames={{ content: "font-semibold text-[0.65rem] font-mono" }}
          color={changeType === "positive" ? "success" : changeType === "negative" ? "danger" : "warning"}
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
    </Card>
  );
}
