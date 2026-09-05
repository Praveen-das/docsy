"use client";

import React from "react";
import Link from "next/link";
import { Menu, Search, Bell, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenUpload?: () => void;
  title?: string;
}

export function Header({
  onToggleSidebar,
  title = "Dashboard",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 w-full items-center justify-between border-b border-zinc-200 bg-white/85 px-4 sm:px-6 backdrop-blur-md dark:border-white/5 dark:bg-[#0e0e12]/85 transition-colors duration-150">
      {/* Left: Mobile Trigger & Breadcrumb Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100 lg:hidden cursor-pointer active:scale-95 transition-transform"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Standalone Brand Logo */}
        <Link href="/dashboard" className="flex items-center lg:hidden mr-0.5" title="Docsy AI Dashboard">
          <Sparkles className="h-5 w-5 shrink-0 fill-zinc-950 text-zinc-950 dark:fill-white dark:text-white" />
        </Link>

        <div className="flex items-center gap-2 text-xs text-zinc-500 min-w-0">
          <span className="hidden sm:inline font-medium text-zinc-500 shrink-0">
            Docsy AI
          </span>
          <span className="hidden sm:inline text-zinc-400 dark:text-zinc-700 shrink-0">/</span>
          <h1 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Actions — Fixed dimensions to eliminate layout shifts */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search trigger (Cmd+K) */}
        <div className="relative hidden md:block">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs text-zinc-600 hover:border-zinc-300 hover:bg-zinc-200/50 hover:text-zinc-900 transition-colors cursor-pointer w-60 justify-between dark:border-white/10 dark:bg-[#141418] dark:text-zinc-400 dark:hover:border-white/20 dark:hover:bg-[#18181e] dark:hover:text-zinc-200">
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <span className="truncate">Search documents...</span>
            </div>
            <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 shadow-2xs shrink-0 dark:border-white/10 dark:bg-[#1c1c22] dark:text-zinc-400">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Theme Quick Switcher (Light / Dark / System) */}
        <ThemeToggle />

        {/* Notification Bell */}
        <button
          className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200 transition-colors cursor-pointer active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#0071e3] ring-2 ring-white dark:ring-[#0e0e12]" />
        </button>
      </div>
    </header>
  );
}
