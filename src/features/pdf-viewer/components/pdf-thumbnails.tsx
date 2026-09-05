"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PdfThumbnailsProps {
  totalPages: number;
  currentPage: number;
  onSelectPage: (page: number) => void;
}

export function PdfThumbnails({
  totalPages,
  currentPage,
  onSelectPage,
}: PdfThumbnailsProps) {
  const pagesToShow = Math.min(totalPages, 20);

  return (
    <div className="w-44 border-r border-zinc-200 bg-white p-2.5 overflow-y-auto space-y-2 dark:border-white/5 dark:bg-[#0e0e12] shrink-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1 mb-2">
        Page Thumbnails
      </p>
      {Array.from({ length: pagesToShow }, (_, i) => i + 1).map((pNum) => (
        <div
          key={pNum}
          onClick={() => onSelectPage(pNum)}
          className={cn(
            "rounded-lg border p-2 text-center transition-all cursor-pointer",
            pNum === currentPage
              ? "border-[#0071e3] bg-blue-50 font-bold text-[#0071e3] shadow-2xs dark:border-[#0071e3] dark:bg-[#0071e3]/10 dark:text-white"
              : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 text-zinc-600 dark:border-white/10 dark:bg-[#141418] dark:hover:border-white/20 dark:text-zinc-400"
          )}
        >
          <div className="h-16 w-full rounded bg-white border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400 font-mono dark:bg-[#18181d] dark:border-white/5 dark:text-zinc-500">
            Page {pNum}
          </div>
          <span className="text-[10px] mt-1 block text-zinc-600 dark:text-zinc-300">
            Page {pNum}
          </span>
        </div>
      ))}
    </div>
  );
}
