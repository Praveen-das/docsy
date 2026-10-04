"use client";

import React, { useMemo } from "react";
import { Check, ChevronDown, List, Grid, SlidersHorizontal, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompactMenu, type CompactMenuItem } from "@/components/ui/compact-menu";
import type { ConversationSortOption } from "./conversations-toolbar";

const SORT_LABELS: Record<ConversationSortOption, string> = {
  newest: "Last updated",
  oldest: "Oldest first",
  title: "Title (A-Z)",
};

export function ConversationDocFilterMenu({
  selectedDocFilter,
  uniqueDocNames,
  isOpen,
  onToggle,
  onSelect,
  isMobile = false,
}: {
  selectedDocFilter: string;
  uniqueDocNames: string[];
  isOpen: boolean;
  onToggle: (open?: boolean) => void;
  onSelect: (docName: string) => void;
  isMobile?: boolean;
}) {
  const sections = useMemo(
    () => [
      {
        items: [
          {
            label: "All Documents",
            onClick: () => onSelect("all"),
            variant: (selectedDocFilter === "all" ? "accent" : "default") as "accent" | "default",
            showChevron: false,
            icon: selectedDocFilter === "all" ? Check : undefined,
          },
          ...uniqueDocNames.map((name) => ({
            label: name,
            onClick: () => onSelect(name),
            variant: (selectedDocFilter === name ? "accent" : "default") as "accent" | "default",
            showChevron: false,
            icon: selectedDocFilter === name ? Check : undefined,
          })),
        ],
      },
    ],
    [selectedDocFilter, uniqueDocNames, onSelect],
  );

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          isMobile
            ? "flex items-center gap-1.5 rounded-full text-xs font-medium px-3 py-1.5 shrink-0 transition-all select-none cursor-pointer active:scale-95 border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c1017]/90 text-zinc-700 dark:text-[#818ea8] hover:text-zinc-900 dark:hover:text-white"
            : "flex items-center gap-1.5 h-9 px-3 rounded-xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c1017]/90 text-xs font-medium text-zinc-700 dark:text-[#818ea8] hover:text-zinc-900 dark:hover:text-[#f1f3f9] hover:border-black/20 dark:hover:border-white/15 shadow-inner backdrop-blur-md transition-all cursor-pointer select-none active:scale-[0.98]",
          selectedDocFilter !== "all" &&
            (isMobile
              ? "border-indigo-500/40 text-indigo-600 dark:text-indigo-300 bg-indigo-500/10"
              : "text-zinc-900 dark:text-white border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5"),
        )}
      >
        {isMobile && <FileText className="h-3 w-3 text-[#818ea8]" />}
        <span className={cn("truncate", isMobile ? "max-w-[100px]" : "max-w-[140px]")}>
          {selectedDocFilter === "all"
            ? isMobile
              ? "Document"
              : "By Document"
            : selectedDocFilter}
        </span>
        <ChevronDown className="h-3 w-3 text-[#727f9d]" />
      </button>

      <CompactMenu
        isOpen={isOpen}
        onClose={() => onToggle(false)}
        width="w-56"
        align="left"
        sections={sections}
      />
    </div>
  );
}

export function ConversationSortMenu({
  sortBy,
  onSortChange,
  isOpen,
  onToggle,
  isMobile = false,
}: {
  sortBy: ConversationSortOption;
  onSortChange: (sort: ConversationSortOption) => void;
  isOpen: boolean;
  onToggle: (open?: boolean) => void;
  isMobile?: boolean;
}) {
  const sortMenuItems = useMemo<CompactMenuItem[]>(
    () => [
      {
        label: "Last updated",
        onClick: () => onSortChange("newest"),
        variant: sortBy === "newest" ? "accent" : "default",
        showChevron: false,
        icon: sortBy === "newest" ? Check : undefined,
      },
      {
        label: "Oldest first",
        onClick: () => onSortChange("oldest"),
        variant: sortBy === "oldest" ? "accent" : "default",
        showChevron: false,
        icon: sortBy === "oldest" ? Check : undefined,
      },
      {
        label: "Title (A-Z)",
        onClick: () => onSortChange("title"),
        variant: sortBy === "title" ? "accent" : "default",
        showChevron: false,
        icon: sortBy === "title" ? Check : undefined,
      },
    ],
    [sortBy, onSortChange],
  );

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          isMobile
            ? "relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c1017]/90 text-zinc-700 dark:text-[#818ea8] hover:text-zinc-900 dark:hover:text-white hover:border-black/20 dark:hover:border-white/15 transition-all shadow-inner backdrop-blur-md cursor-pointer active:scale-95"
            : "flex items-center gap-2 h-9 px-3 rounded-xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c1017]/90 text-xs font-medium text-zinc-800 dark:text-[#f1f5f9] hover:text-zinc-950 dark:hover:text-white hover:border-black/20 dark:hover:border-white/15 shadow-inner backdrop-blur-md will-change-transform transition-all cursor-pointer select-none active:scale-[0.98]",
          (isOpen || sortBy !== "newest") &&
            (isMobile ? "border-indigo-500/40 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10" : ""),
        )}
        title="Sort conversations"
        aria-label="Sort conversations"
      >
        {isMobile ? (
          <>
            <SlidersHorizontal className="h-4 w-4 stroke-[1.8]" />
            {sortBy !== "newest" && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-500" />
            )}
          </>
        ) : (
          <>
            <span className="text-[12px] text-zinc-400 dark:text-[#818ea8]">⇅</span>
            <span>{SORT_LABELS[sortBy]}</span>
            <ChevronDown className="h-3 w-3 text-zinc-400 dark:text-[#727f9d]" />
          </>
        )}
      </button>

      <CompactMenu
        isOpen={isOpen}
        onClose={() => onToggle(false)}
        width="w-44"
        align="right"
        sections={[{ items: sortMenuItems }]}
      />
    </div>
  );
}

export function ConversationViewSwitcher({
  viewMode,
  onViewModeChange,
}: {
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
}) {
  return (
    <div className="flex items-center h-9 rounded-xl bg-white dark:bg-[#0c1017]/90 border border-black/10 dark:border-white/[0.08] p-1 shadow-inner backdrop-blur-md will-change-transform">
      <button
        type="button"
        onClick={() => onViewModeChange("list")}
        className={cn(
          "flex items-center justify-center h-7 w-7 rounded-lg transition-all cursor-pointer",
          viewMode === "list"
            ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30"
            : "text-zinc-500 dark:text-[#818ea8] hover:text-zinc-900 dark:hover:text-white",
        )}
        title="List view"
        aria-label="List view"
      >
        <List className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange("grid")}
        className={cn(
          "flex items-center justify-center h-7 w-7 rounded-lg transition-all cursor-pointer",
          viewMode === "grid"
            ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30"
            : "text-zinc-500 dark:text-[#818ea8] hover:text-zinc-900 dark:hover:text-white",
        )}
        title="Grid view"
        aria-label="Grid view"
      >
        <Grid className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
