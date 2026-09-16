"use client";

import React from "react";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { DocsyIcon } from "@/components/ui/logo";

export interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: (collapsed: boolean) => void;
}

export function SidebarHeader({
  isCollapsed,
  onToggleCollapse,
}: SidebarHeaderProps) {
  return (
    <div className="flex h-20 shrink-0 items-center px-6 relative overflow-hidden bg-transparent">
      {isCollapsed ? (
        /* Collapsed Mode: Stylized D Logo with Expand on Hover */
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <button
            onClick={() => onToggleCollapse(false)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <DocsyIcon className="h-7 w-7 transition-all duration-150 group-hover:opacity-0 group-hover:scale-75" />
            <PanelLeftOpen className="absolute h-5 w-5 opacity-0 scale-75 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 text-zinc-300" />
          </button>
        </div>
      ) : (
        /* Expanded Mode: Docsy Stylized D Logo + "Docsy" Brand Text */
        <div className="flex items-center justify-between w-full min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-3.5 group min-w-0 select-none"
            title="Docsy AI Dashboard"
          >
            <DocsyIcon className="h-8 w-8 transition-transform duration-150 group-hover:scale-105" />
            <span className="font-bold tracking-tight text-white text-[22px] font-sans">
              Docsy
            </span>
          </Link>

          <button
            onClick={() => onToggleCollapse(true)}
            className="hidden lg:flex rounded-lg p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer active:scale-95 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
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
