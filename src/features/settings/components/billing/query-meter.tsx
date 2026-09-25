"use client";

import { Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryMeterProps {
  queriesUsed: number;
  queriesLimit: number;
}

export function QueryMeter({ queriesUsed, queriesLimit }: QueryMeterProps) {
  const queriesRemaining = Math.max(0, queriesLimit - queriesUsed);
  const remainingPercent =
    queriesLimit > 0 ? Math.min(100, Math.max(0, Math.round((queriesRemaining / queriesLimit) * 100))) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-3 w-3" />
          </div>
          <span className="font-medium text-zinc-200">Daily Query Allowance</span>
        </div>
        <span className="font-mono text-zinc-400">
          <span className="text-zinc-100 font-semibold">{queriesUsed}</span> / {queriesLimit} queries
        </span>
      </div>

      {/* Progress Bar (draining allowance) */}
      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden p-0.5">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            remainingPercent <= 10
              ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
              : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.35)]",
          )}
          style={{ width: `${remainingPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
        <span className="text-indigo-300 font-medium">{queriesRemaining} remaining today</span>
        <span className="inline-flex items-center gap-1 text-zinc-500">
          <Clock className="h-3 w-3" />
          Resets at 00:00 UTC
        </span>
      </div>
    </div>
  );
}
