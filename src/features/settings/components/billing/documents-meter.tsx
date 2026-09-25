"use client";

import React from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentsMeterProps {
  documentsCount: number;
  documentsLimit: number | null;
}

export function DocumentsMeter({ documentsCount, documentsLimit }: DocumentsMeterProps) {
  const docPercent = documentsLimit ? Math.min(100, Math.round((documentsCount / documentsLimit) * 100)) : 0;

  const remainingSlots = documentsLimit ? Math.max(0, documentsLimit - documentsCount) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileText className="h-3 w-3" />
          </div>
          <span className="font-medium text-zinc-200">Document Storage</span>
        </div>
        <span className="font-mono text-zinc-400">
          <span className="text-zinc-100 font-semibold">{documentsCount}</span>
          {documentsLimit ? ` / ${documentsLimit} documents` : " documents (Unlimited)"}
        </span>
      </div>

      {documentsLimit && (
        <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden p-0.5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              docPercent > 90
                ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_6px_rgba(6,182,212,0.35)]",
            )}
            style={{ width: `${Math.max(3, docPercent)}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
        <span>{remainingSlots !== null ? `${remainingSlots} slots remaining` : "Unlimited upload capacity"}</span>
        <span className="font-mono">{documentsLimit ? `${docPercent}% capacity` : "Pro tier"}</span>
      </div>
    </div>
  );
}
