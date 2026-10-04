"use client";

import React, { useRef, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterTabs, FilterPills, type FilterTabOption } from "@/components/ui/filter-tabs";
import {
  ConversationDocFilterMenu,
  ConversationSortMenu,
  ConversationViewSwitcher,
} from "./conversations-toolbar-menus";

export type ConversationFilterTab = "all" | "recent" | "pinned";
export type ConversationSortOption = "newest" | "oldest" | "title";

const FILTER_TABS: FilterTabOption<ConversationFilterTab>[] = [
  { id: "all", label: "All" },
  { id: "recent", label: "Recent" },
  { id: "pinned", label: "Pinned" },
];

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

  return (
    <div className="w-full space-y-3">
      {/* ─── MOBILE TOOLBAR ─── */}
      <div className="flex sm:hidden flex-col gap-3 w-full">
        {/* Full-width Search Input */}
        <div className="relative flex items-center w-full">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-[#818ea8] stroke-[2] z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="h-11 w-full rounded-2xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c1017]/90 pl-10 pr-9 text-[13px] text-zinc-900 dark:text-[#f1f5f9] placeholder:text-zinc-400 dark:placeholder:text-[#687593] shadow-inner backdrop-blur-md focus:border-indigo-500/50 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-[#818ea8] dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills + Document Dropdown + Sort Button */}
        <div className="flex items-center justify-between gap-2 w-full">
          <FilterPills<ConversationFilterTab>
            options={FILTER_TABS}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />

          <ConversationDocFilterMenu
            selectedDocFilter={selectedDocFilter}
            uniqueDocNames={uniqueDocNames}
            isOpen={isDocDropdownOpen}
            onToggle={onToggleDocDropdown}
            onSelect={onDocFilterChange}
            isMobile
          />

          <ConversationSortMenu
            sortBy={sortBy}
            onSortChange={onSortChange}
            isOpen={isSortOpen}
            onToggle={onToggleSortOpen}
            isMobile
          />
        </div>
      </div>

      {/* ─── DESKTOP TOOLBAR ─── */}
      <div className="hidden sm:flex flex-row items-center justify-between gap-3 pt-1 w-full">
        {/* Left Controls: Filter Tabs + By Document Dropdown + Search */}
        <div className="flex items-center gap-2.5 flex-nowrap">
          <FilterTabs<ConversationFilterTab>
            options={FILTER_TABS}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />

          <ConversationDocFilterMenu
            selectedDocFilter={selectedDocFilter}
            uniqueDocNames={uniqueDocNames}
            isOpen={isDocDropdownOpen}
            onToggle={onToggleDocDropdown}
            onSelect={onDocFilterChange}
          />

          {/* Expandable Search Input */}
          <div className="relative flex items-center">
            {searchExpanded ? (
              <div className="relative flex items-center h-9 w-52 sm:w-60 lg:w-72 transition-all duration-200 animate-in fade-in zoom-in-95">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-[#818ea8] stroke-[2] z-10" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search conversations..."
                  className="h-9 w-full rounded-xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c1017]/90 pl-9 pr-8 text-xs text-zinc-900 dark:text-[#f1f5f9] placeholder:text-zinc-400 dark:placeholder:text-[#687593] shadow-inner backdrop-blur-md will-change-transform focus:border-indigo-500/50 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                    handleToggleSearch(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-[#818ea8] dark:hover:text-white transition-colors cursor-pointer"
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
                  "relative flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 dark:border-white/[0.08] bg-white dark:bg-[#0c1017]/90 text-zinc-600 dark:text-[#818ea8] hover:text-zinc-900 dark:hover:text-white hover:border-black/20 dark:hover:border-white/15 transition-all shadow-inner backdrop-blur-md cursor-pointer active:scale-[0.98] will-change-transform",
                  searchQuery && "text-indigo-600 dark:text-indigo-400 border-indigo-500/40 bg-indigo-500/10",
                )}
                title="Search conversations"
                aria-label="Search conversations"
              >
                <Search className="h-4 w-4 stroke-[2]" />
                {searchQuery && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-indigo-500" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Sort Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          <ConversationSortMenu
            sortBy={sortBy}
            onSortChange={onSortChange}
            isOpen={isSortOpen}
            onToggle={onToggleSortOpen}
          />

          <ConversationViewSwitcher
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        </div>
      </div>
    </div>
  );
}
