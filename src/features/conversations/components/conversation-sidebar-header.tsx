"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, PanelLeftClose, PanelLeftOpen, ArrowLeft } from "lucide-react";

export interface ConversationSidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
  onClose?: () => void;
}

export function ConversationSidebarHeader({
  isCollapsed,
  onToggleCollapse,
  onClose,
}: ConversationSidebarHeaderProps) {
  return (
    <>
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center border-b border-zinc-200 px-3.5 relative overflow-hidden dark:border-white/5">
        {isCollapsed ? (
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

      {/* Top Navigation: Return to All Documents */}
      <div className="px-3.5 pt-2 pb-1 border-b border-zinc-200/70 dark:border-white/5">
        <Link
          href="/documents"
          onClick={onClose}
          title={isCollapsed ? "All Documents" : undefined}
          className="group relative flex h-8 items-center rounded-md text-xs font-medium transition-colors select-none tracking-[-0.01em] p-0 w-full overflow-hidden text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/60 active:bg-zinc-200/50 dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-white/[0.04] dark:active:bg-white/[0.07]"
        >
          <div className="w-10 h-8 flex items-center justify-center shrink-0">
            <ArrowLeft className="h-4 w-4 text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
          </div>
          {!isCollapsed && (
            <span className="truncate pr-3 font-medium text-xs">
              All Documents
            </span>
          )}
        </Link>
      </div>
    </>
  );
}
