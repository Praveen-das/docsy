"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
}

export function SidebarHeader({
  isCollapsed,
  onToggleCollapse,
}: SidebarHeaderProps) {
  return (
    <div className="flex h-16 shrink-0 items-center border-b border-zinc-200 px-3.5 relative overflow-hidden dark:border-white/5">
      {isCollapsed ? (
        /* Collapsed Mode: Solid Standalone Brand Icon with Hover-to-Expand Switch */
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <button
            onClick={() => onToggleCollapse(false)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <Sparkles className="h-6 w-6 shrink-0 fill-zinc-950 text-zinc-950 dark:fill-white dark:text-white transition-all duration-150 group-hover:opacity-0 group-hover:scale-75" />
            <PanelLeftOpen className="absolute h-5 w-5 opacity-0 scale-75 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 text-zinc-600 dark:text-zinc-300" />
          </button>
        </div>
      ) : (
        /* Expanded Mode: Solid Standalone Brand Link & Collapse Button */
        <div className="flex items-center justify-between w-full min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center group min-w-0"
            title="Docsy AI Dashboard"
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 shrink-0 fill-zinc-950 text-zinc-950 dark:fill-white dark:text-white transition-transform duration-150 group-hover:scale-105" />
            </div>

            <span className="font-bold tracking-tight text-zinc-900 dark:text-white text-base truncate ml-2.5">
              Docsy AI
            </span>
          </Link>

          <button
            onClick={() => onToggleCollapse(true)}
            className="hidden lg:flex rounded-md p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors cursor-pointer active:scale-95 shrink-0 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/5"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
