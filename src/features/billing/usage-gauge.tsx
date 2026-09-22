"use client";

import { cn } from "@/lib/utils";

interface UsageGaugeProps {
  used: number;
  limit: number;
  className?: string;
}

/**
 * Animated usage gauge showing daily query consumption.
 * Color shifts from emerald → amber → rose as usage increases.
 */
export function UsageGauge({ used, limit, className }: UsageGaugeProps) {
  const percent = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
  const remaining = Math.max(limit - used, 0);

  const barColor =
    percent >= 90
      ? "bg-rose-500"
      : percent >= 70
        ? "bg-amber-500"
        : "bg-emerald-500";

  const textColor =
    percent >= 90
      ? "text-rose-600 dark:text-rose-400"
      : percent >= 70
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-zinc-700 dark:text-zinc-300 font-semibold">Daily Queries</span>
        <span className={cn("font-mono", textColor)}>
          {used} / {limit}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>{remaining} remaining today</span>
        <span>Resets midnight UTC</span>
      </div>
    </div>
  );
}
