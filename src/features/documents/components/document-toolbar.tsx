"use client";

import { useRef, useEffect, useMemo } from "react";
import { Search, X, Check, Grid, List, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompactMenu, CompactMenuItem } from "@/components/ui/compact-menu";
import { DocumentFilterTabs, DocumentFilterTab } from "@/features/documents/components/document-filter-tabs";
import { DocumentSortOption } from "@/features/documents/hooks/use-document-filters";

export type DocumentViewMode = "grid" | "list";

export interface DocumentToolbarProps {
  activeTab: DocumentFilterTab;
  onTabChange: (tab: DocumentFilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchExpanded: boolean;
  onToggleSearch: (expanded: boolean) => void;
  sortBy: DocumentSortOption;
  onSortChange: (sort: DocumentSortOption) => void;
  isSortOpen: boolean;
  onToggleSort: (open: boolean) => void;
  viewMode: DocumentViewMode;
  onViewModeChange: (mode: DocumentViewMode) => void;
}

const SORT_LABELS: Record<DocumentSortOption, string> = {
  newest: "Last uploaded",
  oldest: "Oldest",
  name: "Name",
  size: "File size",
};

const MOBILE_FILTER_TABS: { id: DocumentFilterTab; label: string }[] = [
  { id: "all", label: "All documents" },
  { id: "favorites", label: "Favorites" },
  { id: "processing", label: "Processing" },
  { id: "failed", label: "Failed" },
];

export function DocumentToolbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  isSearchExpanded,
  onToggleSearch,
  sortBy,
  onSortChange,
  isSortOpen,
  onToggleSort,
  viewMode,
  onViewModeChange,
}: DocumentToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchExpanded]);

  const sortMenuItems = useMemo<CompactMenuItem[]>(
    () => [
      {
        label: "Last uploaded",
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
        label: "File name",
        onClick: () => onSortChange("name"),
        variant: sortBy === "name" ? "accent" : "default",
        showChevron: false,
        icon: sortBy === "name" ? Check : undefined,
      },
      {
        label: "File size",
        onClick: () => onSortChange("size"),
        variant: sortBy === "size" ? "accent" : "default",
        showChevron: false,
        icon: sortBy === "size" ? Check : undefined,
      },
    ],
    [sortBy, onSortChange],
  );

  return (
    <div className="w-full">
      {/* ─── MOBILE TOOLBAR: Full-width search bar + Pills & Sort Slider (Matching Reference Image) ─── */}
      <div className="flex sm:hidden flex-col gap-3 w-full">
        {/* Full-width Search Input */}
        <div className="relative flex items-center w-full">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#818ea8] stroke-[2] z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents..."
            className="h-11 w-full rounded-2xl border border-white/[0.08] bg-[#0c1017]/90 pl-10 pr-9 text-[13px] text-[#f1f5f9] placeholder:text-[#687593] shadow-inner backdrop-blur-md will-change-transform focus:border-indigo-500/50 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#818ea8] hover:text-white transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills + Sliders Sort Button Row */}
        <div className="flex items-center justify-between gap-2.5 w-full">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 min-w-0 py-0.5">
            {MOBILE_FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "rounded-full text-xs font-medium px-3.5 py-1.5 shrink-0 transition-all select-none cursor-pointer active:scale-95",
                    isActive
                      ? "border border-indigo-500/50 bg-indigo-500/15 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                      : "border border-white/[0.08] bg-[#0c1017]/90 text-[#818ea8] hover:text-white",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Filter/Sort Sliders Button */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSort(!isSortOpen);
              }}
              className={cn(
                "relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0c1017]/90 text-[#818ea8] hover:text-white hover:border-white/15 transition-all shadow-inner backdrop-blur-md cursor-pointer active:scale-95",
                (isSortOpen || sortBy !== "newest") && "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
              )}
              title="Sort options"
              aria-label="Sort options"
            >
              <SlidersHorizontal className="h-4 w-4 stroke-[1.8]" />
              {sortBy !== "newest" && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-500" />
              )}
            </button>

            <CompactMenu
              isOpen={isSortOpen}
              onClose={() => onToggleSort(false)}
              width="w-40"
              align="right"
              sections={[{ items: sortMenuItems }]}
            />
          </div>
        </div>
      </div>

      {/* ─── DESKTOP TOOLBAR: FilterTabs, Expandable Search, Sort Dropdown & Switcher ─── */}
      <div className="hidden sm:flex flex-row items-center justify-between gap-3 pt-1 w-full">
        {/* Left Group: Filter Tabs Capsule + Expandable Search Icon Button */}
        <div className="flex items-center gap-2.5 flex-nowrap">
          <DocumentFilterTabs activeTab={activeTab} onTabChange={onTabChange} />

          {/* Expandable Search Input */}
          <div className="relative flex items-center">
            {isSearchExpanded ? (
              <div className="relative flex items-center h-9 w-60 sm:w-72 transition-all duration-200 animate-in fade-in zoom-in-95">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#818ea8] stroke-[2] z-10" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search documents..."
                  className="h-9 w-full rounded-xl border border-white/[0.08] bg-[#0c1017]/90 pl-9 pr-8 text-xs text-[#f1f5f9] placeholder:text-[#687593] shadow-inner backdrop-blur-md will-change-transform focus:border-indigo-500/50 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                    onToggleSearch(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#818ea8] hover:text-white transition-colors cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onToggleSearch(true)}
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0c1017]/90 text-[#818ea8] hover:text-white hover:border-white/15 transition-all shadow-inner backdrop-blur-md cursor-pointer active:scale-[0.98] will-change-transform",
                  searchQuery && "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
                )}
                title="Search documents"
                aria-label="Search documents"
              >
                <Search className="h-4 w-4 stroke-[2]" />
                {searchQuery && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-500" />}
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Sort Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSort(!isSortOpen);
              }}
              className="flex items-center gap-2 h-9 px-3 rounded-xl border border-white/[0.08] bg-[#0c1017]/90 text-xs font-medium text-[#f1f5f9] hover:text-white hover:border-white/15 shadow-inner backdrop-blur-md will-change-transform transition-all cursor-pointer select-none active:scale-[0.98]"
            >
              <span>{SORT_LABELS[sortBy]}</span>
              <span className="text-[9px] text-[#818ea8] transition-transform duration-150">▼</span>
            </button>

            <CompactMenu
              isOpen={isSortOpen}
              onClose={() => onToggleSort(false)}
              width="w-40"
              align="right"
              sections={[{ items: sortMenuItems }]}
            />
          </div>

          {/* View Switcher Capsule (Grid vs List) */}
          <div className="flex items-center h-9 rounded-xl bg-[#0c1017]/90 border border-white/[0.08] p-1 shadow-inner backdrop-blur-md will-change-transform">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "flex items-center justify-center h-7 w-7 rounded-lg transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-white/10 text-white shadow-xs border border-white/10"
                  : "text-[#818ea8] hover:text-white",
              )}
              title="Grid view"
              aria-label="Grid view"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={cn(
                "flex items-center justify-center h-7 w-7 rounded-lg transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-white/10 text-white shadow-xs border border-white/10"
                  : "text-[#818ea8] hover:text-white",
              )}
              title="List view"
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
