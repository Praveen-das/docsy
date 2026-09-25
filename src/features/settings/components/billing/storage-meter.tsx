"use client";

import React from "react";
import { HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface StorageMeterProps {
  totalBytesUsed: number;
  storageLimitBytes: number;
}

export function formatStorageSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 MB";
  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;

  if (gb >= 1) {
    return `${gb.toFixed(1)} GB`;
  }
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }
  if (kb >= 1) {
    return `${kb.toFixed(0)} KB`;
  }
  return `${bytes} B`;
}

export function StorageMeter({ totalBytesUsed, storageLimitBytes }: StorageMeterProps) {
  const storagePercent = Math.min(
    100,
    Math.round((totalBytesUsed / (storageLimitBytes || 1)) * 100)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HardDrive className="h-3 w-3" />
          </div>
          <span className="font-medium text-zinc-200">Storage Usage</span>
        </div>
        <span className="font-mono text-zinc-400">
          <span className="text-zinc-100 font-semibold">{formatStorageSize(totalBytesUsed)}</span> /{" "}
          {formatStorageSize(storageLimitBytes)}
        </span>
      </div>

      {/* Storage Progress Bar */}
      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden p-0.5">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            storagePercent > 90
              ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
              : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.35)]"
          )}
          style={{ width: `${storagePercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
        <span className="text-emerald-300/90 font-medium">
          {formatStorageSize(Math.max(0, storageLimitBytes - totalBytesUsed))} available
        </span>
        <span className="font-mono">{storagePercent}% used</span>
      </div>
    </div>
  );
}
