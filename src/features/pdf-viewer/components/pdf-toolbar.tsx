"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Bookmark,
  Layers,
} from "lucide-react";

export interface PdfToolbarProps {
  currentPage: number;
  totalPages: number;
  showThumbnails: boolean;
  zoomLevel: number;
  searchInDoc: string;
  isTargetCitationOnPage: boolean;
  onToggleThumbnails: () => void;
  onPageChange: (page: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onSearchChange: (search: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function PdfToolbar({
  currentPage,
  totalPages,
  showThumbnails,
  zoomLevel,
  searchInDoc,
  isTargetCitationOnPage,
  onToggleThumbnails,
  onPageChange,
  onPrevPage,
  onNextPage,
  onSearchChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: PdfToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 text-xs gap-2 dark:border-white/5 dark:bg-[#0e0e12]/95 shrink-0">
      {/* Page Stepper & Thumbnail Toggle */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleThumbnails}
          className={cn(
            "h-7 w-7 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
            showThumbnails && "bg-zinc-200 text-zinc-900 dark:bg-white/10 dark:text-white"
          )}
          title="Toggle thumbnail navigation"
          aria-label="Toggle thumbnail navigation"
        >
          <Layers className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-zinc-200 mx-0.5 dark:bg-white/10" />

        <Button
          variant="outline"
          size="icon"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="h-7 w-7"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-center gap-1 text-zinc-700 font-medium dark:text-zinc-300">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Page</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= totalPages) {
                onPageChange(val);
              }
            }}
            className="h-7 w-12 rounded-md border border-zinc-300 bg-zinc-50 text-center font-mono text-xs font-semibold text-zinc-900 focus:border-[#0071e3] focus:outline-none dark:border-white/10 dark:bg-[#18181d] dark:text-zinc-100"
          />
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            of {totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="h-7 w-7"
          aria-label="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Citation Locator Indicator */}
      {isTargetCitationOnPage && (
        <div className="flex items-center gap-1.5 rounded-full bg-amber-100/90 px-3 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-300 animate-pulse dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/30">
          <Bookmark className="h-3 w-3 text-amber-600 dark:text-amber-400" />
          <span>Passage spotlight active</span>
        </div>
      )}

      {/* Zoom & Search Controls */}
      <div className="flex items-center gap-1.5">
        <div className="relative hidden md:block">
          <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchInDoc}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Find in page..."
            className="h-7 w-32 rounded-md border border-zinc-300 bg-zinc-50 pl-7 pr-2 text-[11px] text-zinc-900 placeholder:text-zinc-400 focus:w-44 focus:border-[#0071e3] focus:outline-none transition-all dark:border-white/10 dark:bg-[#18181d] dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="h-4 w-px bg-zinc-200 mx-1 hidden sm:block dark:bg-white/10" />

        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          title="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="min-w-[36px] text-center font-mono text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          {zoomLevel}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          title="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomReset}
          className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          title="Reset Zoom"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
