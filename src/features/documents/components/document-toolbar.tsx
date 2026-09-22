"use client";

import { useRef, useEffect } from "react";
import { Search, X, Check, Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompactMenu } from "@/components/ui/compact-menu";
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

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
      {/* Left Group: Filter Tabs Capsule + Expandable Search Icon Button */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
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
      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
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
            sections={[
              {
                items: [
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
              },
            ]}
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
  );
}
