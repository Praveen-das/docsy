import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
  showLabel?: boolean;
}

export function Progress({
  value,
  className,
  indicatorColor = "bg-blue-600",
  showLabel = false,
  ...props
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("w-full space-y-1", className)} {...props}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-200 border border-zinc-200/80 dark:bg-zinc-800 dark:border-white/5">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            indicatorColor
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 font-medium">
          <span>Progress</span>
          <span>{clampedValue}%</span>
        </div>
      )}
    </div>
  );
}
