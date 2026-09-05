"use client";

import React, { useState } from "react";
import { Citation } from "@/types";
import { Bookmark, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CitationPillProps {
  citation: Citation;
  onClick?: (citation: Citation) => void;
  isActive?: boolean;
}

export function CitationPill({
  citation,
  onClick,
  isActive = false,
}: CitationPillProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block my-0.5">
      <button
        onClick={() => onClick && onClick(citation)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium transition-all duration-120 border cursor-pointer select-none active:scale-[0.97]",
          isActive
            ? "bg-amber-600 text-white border-amber-600 shadow-xs shadow-amber-600/30 dark:border-amber-500"
            : "bg-amber-50 text-amber-900 border-amber-300/80 hover:bg-amber-100 hover:border-amber-400 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/30 dark:hover:bg-amber-950/70 dark:hover:border-amber-400/50"
        )}
        title={`Jump to Page ${citation.page} in document`}
      >
        <Bookmark
          className={cn(
            "h-3 w-3",
            isActive ? "text-white" : "text-amber-600 group-hover:text-amber-700 dark:text-amber-400 dark:group-hover:text-amber-300"
          )}
        />
        <span className="font-semibold">
          Page {citation.page}
        </span>
        <span
          className={cn(
            "rounded px-1 text-[10px] font-medium",
            isActive
              ? "bg-amber-700 text-white"
              : "bg-amber-200/70 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/80"
          )}
        >
          {Math.round(citation.relevanceScore * 100)}% match
        </span>
        <ArrowUpRight
          className={cn(
            "h-2.5 w-2.5 opacity-60 group-hover:opacity-100 transition-opacity",
            isActive ? "text-white" : "text-amber-600 dark:text-amber-400"
          )}
        />
      </button>

      {/* Hover Snippet Preview Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-80 rounded-xl border border-zinc-200 bg-white p-3.5 text-xs text-zinc-900 shadow-xl dark:border-white/10 dark:bg-[#121216] dark:text-white dark:shadow-2xl animate-in fade-in zoom-in-95 pointer-events-none">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-1.5 mb-2 text-[10px] text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Bookmark className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              Cited Source (Page {citation.page})
            </span>
            <span className="truncate max-w-[120px] text-zinc-500 dark:text-zinc-400">{citation.documentName}</span>
          </div>
          <p className="line-clamp-4 text-zinc-700 dark:text-zinc-200 italic text-[11px] leading-relaxed bg-zinc-50 dark:bg-black/60 p-2 rounded-lg border border-zinc-200/80 dark:border-white/5">
            &ldquo;{citation.textSnippet}&rdquo;
          </p>
          <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
            <span>Click to spotlight passage on Page {citation.page}</span>
          </div>
        </div>
      )}
    </div>
  );
}
