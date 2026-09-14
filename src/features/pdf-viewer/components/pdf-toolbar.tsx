"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Layers,
} from "lucide-react";

export interface PdfToolbarProps {
  currentPage: number;
  totalPages: number;
  showThumbnails: boolean;
  zoomLevel: number;
  searchInDoc: string;
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
    <div className="flex h-12 items-center justify-between border-b border-zinc-200 bg-white px-3 sm:px-4 text-xs select-none dark:border-white/5 dark:bg-[#111114]">
      {/* Left: Thumbnail toggle & Page switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant={showThumbnails ? "secondary" : "ghost"}
          size="icon"
          onClick={onToggleThumbnails}
          className="h-7 w-7 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          title="Toggle page thumbnails"
          aria-label="Toggle page thumbnails"
        >
          <Layers className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-zinc-200 mx-1 hidden sm:block dark:bg-white/10" />

        {/* Page Nav */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="h-7 w-7"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
          <span>Page</span>
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
            className="h-6 w-10 rounded border border-zinc-300 bg-zinc-50 text-center text-xs font-semibold text-zinc-900 focus:border-[#0071e3] focus:outline-none dark:border-white/10 dark:bg-[#18181d] dark:text-zinc-100"
          />
          <span>of</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-200">{totalPages}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="h-7 w-7"
          aria-label="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

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
          aria-label="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>

        <span className="w-10 text-center text-[11px] font-medium text-zinc-600 dark:text-zinc-400 select-none">
          {zoomLevel}%
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          title="Zoom in"
          aria-label="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomReset}
          className="h-7 w-7 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          title="Reset Zoom"
          aria-label="Reset Zoom"
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
