"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, List, Grid, Search, X, SlidersHorizontal, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterTabs, FilterTabOption } from "@/components/ui/filter-tabs";
import { CompactMenu, CompactMenuItem } from "@/components/ui/compact-menu";

export type ConversationFilterTab = "all" | "recent" | "pinned";
export type ConversationSortOption = "newest" | "oldest" | "title";

export const FILTER_TABS: FilterTabOption<ConversationFilterTab>[] = [
  { id: "all", label: "All" },
  { id: "recent", label: "Recent" },
  { id: "pinned", label: "Pinned" },
];

export const SORT_LABELS: Record<ConversationSortOption, string> = {
  newest: "Last updated",
  oldest: "Oldest first",
  title: "Title (A-Z)",
};

export interface ConversationsToolbarProps {
  activeTab: ConversationFilterTab;
  onTabChange: (tab: ConversationFilterTab) => void;
  selectedDocFilter: string;
  onDocFilterChange: (docName: string) => void;
  uniqueDocNames: string[];
  isDocDropdownOpen: boolean;
  onToggleDocDropdown: (open?: boolean) => void;
  sortBy: ConversationSortOption;
  onSortChange: (sort: ConversationSortOption) => void;
  isSortOpen: boolean;
  onToggleSortOpen: (open?: boolean) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchExpanded?: boolean;
  onToggleSearch?: (expanded: boolean) => void;
}

export function ConversationsToolbar({
  activeTab,
  onTabChange,
  selectedDocFilter,
  onDocFilterChange,
  uniqueDocNames,
  isDocDropdownOpen,
  onToggleDocDropdown,
  sortBy,
  onSortChange,
  isSortOpen,
  onToggleSortOpen,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  isSearchExpanded,
  onToggleSearch,
}: ConversationsToolbarProps) {
  const [internalSearchExpanded, setInternalSearchExpanded] = useState(false);
  const searchExpanded = isSearchExpanded !== undefined ? isSearchExpanded : internalSearchExpanded;
  const handleToggleSearch = onToggleSearch ?? setInternalSearchExpanded;
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchExpanded) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [searchExpanded]);
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
    <div className="w-full space-y-3">
      {/* ─── MOBILE TOOLBAR: Full-width search bar + Pills & Filter/Sort Dropdowns ─── */}
      <div className="flex sm:hidden flex-col gap-3 w-full">
        {/* Full-width Search Input */}
        <div className="relative flex items-center w-full">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#818ea8] stroke-[2] z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="h-11 w-full rounded-2xl border border-white/[0.08] bg-[#0c1017]/90 pl-10 pr-9 text-[13px] text-[#f1f5f9] placeholder:text-[#687593] shadow-inner backdrop-blur-md focus:border-indigo-500/50 focus:outline-none transition-all"
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

        {/* Filter Pills + Document Dropdown + Sort Button */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 min-w-0 py-0.5">
            {FILTER_TABS.map((tab) => {
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

            {/* Mobile "By Document" Filter Capsule */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDocDropdown();
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-full text-xs font-medium px-3 py-1.5 shrink-0 transition-all select-none cursor-pointer active:scale-95 border border-white/[0.08] bg-[#0c1017]/90 text-[#818ea8] hover:text-white",
                  selectedDocFilter !== "all" && "border-indigo-500/40 text-indigo-300 bg-indigo-500/10",
                )}
              >
                <FileText className="h-3 w-3 text-[#818ea8]" />
                <span className="truncate max-w-[100px]">
                  {selectedDocFilter === "all" ? "Document" : selectedDocFilter}
                </span>
                <ChevronDown className="h-3 w-3 text-[#727f9d]" />
              </button>

              <CompactMenu
                isOpen={isDocDropdownOpen}
                onClose={() => onToggleDocDropdown(false)}
                width="w-56"
                align="left"
                sections={[
                  {
                    items: [
                      {
                        label: "All Documents",
                        onClick: () => onDocFilterChange("all"),
                        variant: selectedDocFilter === "all" ? "accent" : "default",
                        showChevron: false,
                        icon: selectedDocFilter === "all" ? Check : undefined,
                      },
                      ...uniqueDocNames.map((name) => ({
                        label: name,
                        onClick: () => onDocFilterChange(name),
                        variant: (selectedDocFilter === name ? "accent" : "default") as "accent" | "default",
                        showChevron: false,
                        icon: selectedDocFilter === name ? Check : undefined,
                      })),
                    ],
                  },
                ]}
              />
            </div>
          </div>

          {/* Sort Sliders Button on Mobile */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSortOpen();
              }}
              className={cn(
                "relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0c1017]/90 text-[#818ea8] hover:text-white hover:border-white/15 transition-all shadow-inner backdrop-blur-md cursor-pointer active:scale-95",
                (isSortOpen || sortBy !== "newest") && "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
              )}
              title="Sort conversations"
              aria-label="Sort conversations"
            >
              <SlidersHorizontal className="h-4 w-4 stroke-[1.8]" />
              {sortBy !== "newest" && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-500" />
              )}
            </button>

            <CompactMenu
              isOpen={isSortOpen}
              onClose={() => onToggleSortOpen(false)}
              width="w-44"
              align="right"
              sections={[{ items: sortMenuItems }]}
            />
          </div>
        </div>
      </div>

      {/* ─── DESKTOP TOOLBAR: FilterTabs, Document Capsule, Sort Dropdown & Switcher ─── */}
      <div className="hidden sm:flex flex-row items-center justify-between gap-3 pt-1 w-full">
        {/* Left Controls: Filter Tabs + By Document Dropdown */}
        <div className="flex items-center gap-2.5 flex-nowrap">
          <FilterTabs<ConversationFilterTab>
            options={FILTER_TABS}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />

          {/* "By Document" Filter Capsule Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleDocDropdown();
              }}
              className={cn(
                "flex items-center gap-1.5 h-9 px-3 rounded-xl border border-white/[0.08] bg-[#0c1017]/90 text-xs font-medium",
                "text-[#818ea8] hover:text-[#f1f3f9] hover:border-white/15 shadow-inner backdrop-blur-md transition-all cursor-pointer select-none active:scale-[0.98]",
                selectedDocFilter !== "all" && "text-white border-white/20 bg-white/5",
              )}
            >
              <span className="truncate max-w-[140px]">
                {selectedDocFilter === "all" ? "By Document" : selectedDocFilter}
              </span>
              <ChevronDown className="h-3 w-3 text-[#727f9d]" />
            </button>

            <CompactMenu
              isOpen={isDocDropdownOpen}
              onClose={() => onToggleDocDropdown(false)}
              width="w-56"
              align="left"
              sections={[
                {
                  items: [
                    {
                      label: "All Documents",
                      onClick: () => onDocFilterChange("all"),
                      variant: selectedDocFilter === "all" ? "accent" : "default",
                      showChevron: false,
                      icon: selectedDocFilter === "all" ? Check : undefined,
                    },
                    ...uniqueDocNames.map((name) => ({
                      label: name,
                      onClick: () => onDocFilterChange(name),
                      variant: (selectedDocFilter === name ? "accent" : "default") as "accent" | "default",
                      showChevron: false,
                      icon: selectedDocFilter === name ? Check : undefined,
                    })),
                  ],
                },
              ]}
            />
          </div>

          {/* Expandable Search Input */}
          <div className="relative flex items-center">
            {searchExpanded ? (
              <div className="relative flex items-center h-9 w-52 sm:w-60 lg:w-72 transition-all duration-200 animate-in fade-in zoom-in-95">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#818ea8] stroke-[2] z-10" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search conversations..."
                  className="h-9 w-full rounded-xl border border-white/[0.08] bg-[#0c1017]/90 pl-9 pr-8 text-xs text-[#f1f5f9] placeholder:text-[#687593] shadow-inner backdrop-blur-md will-change-transform focus:border-indigo-500/50 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                    handleToggleSearch(false);
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
                onClick={() => handleToggleSearch(true)}
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0c1017]/90 text-[#818ea8] hover:text-white hover:border-white/15 transition-all shadow-inner backdrop-blur-md cursor-pointer active:scale-[0.98] will-change-transform",
                  searchQuery && "text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
                )}
                title="Search conversations"
                aria-label="Search conversations"
              >
                <Search className="h-4 w-4 stroke-[2]" />
                {searchQuery && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-500" />}
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Sort Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSortOpen();
              }}
              className="flex items-center gap-2 h-9 px-3 rounded-xl border border-white/[0.08] bg-[#0c1017]/90 text-xs font-medium text-[#f1f5f9] hover:text-white hover:border-white/15 shadow-inner backdrop-blur-md will-change-transform transition-all cursor-pointer select-none active:scale-[0.98]"
            >
              <span className="text-[12px] text-[#818ea8]">⇅</span>
              <span>{SORT_LABELS[sortBy]}</span>
              <ChevronDown className="h-3 w-3 text-[#727f9d]" />
            </button>

            <CompactMenu
              isOpen={isSortOpen}
              onClose={() => onToggleSortOpen(false)}
              width="w-44"
              align="right"
              sections={[{ items: sortMenuItems }]}
            />
          </div>

          {/* View Switcher Capsule (List vs Grid) */}
          <div className="flex items-center h-9 rounded-xl bg-[#0c1017]/90 border border-white/[0.08] p-1 shadow-inner backdrop-blur-md will-change-transform">
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={cn(
                "flex items-center justify-center h-7 w-7 rounded-lg transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30"
                  : "text-[#818ea8] hover:text-white",
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
                  : "text-[#818ea8] hover:text-white",
              )}
              title="Grid view"
              aria-label="Grid view"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
