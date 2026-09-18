"use client";

import React, { useEffect } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export interface HeaderSearchBarProps {
  className?: string;
  onOpen?: () => void;
}

/**
 * Self-contained search bar pill matching the reference design.
 * Uses `useUIStore` selector for zero-prop-drilling trigger,
 * while still supporting an optional local callback if overridden.
 * Handles `Cmd+K` / `Ctrl+K` keyboard shortcut globally.
 */
export function HeaderSearchBar({ className, onOpen }: HeaderSearchBarProps) {
  const openSearch = useUIStore((state) => state.openSearch);

  const handleClick = () => {
    if (onOpen) {
      onOpen();
    } else {
      openSearch();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("w-full max-w-[420px] sm:max-w-[460px]", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Search documents and conversations"
        className="group relative flex h-11 w-full items-center justify-between rounded-2xl border border-[#212738]/70 bg-(--surface-card)/90 px-4 text-xs text-zinc-300 shadow-inner backdrop-blur-md transition-all hover:border-[#333d59] hover:bg-[#111424] cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500/50"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Search className="h-4 w-4 text-[#727f9d] group-hover:text-zinc-200 transition-colors shrink-0 stroke-[1.8]" />
          <span className="truncate text-[#687593] group-hover:text-[#91a0c4] select-none text-[13.5px] font-normal transition-colors">
            Search documents, conversations...
          </span>
        </div>

        <kbd className="hidden sm:inline-flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-sans tracking-wide text-[#727f9d] select-none shadow-2xs">
          Ctrl K
        </kbd>
      </div>
    </div>
  );
}
