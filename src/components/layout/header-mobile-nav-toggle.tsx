"use client";

import React from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useUIStore } from "@/stores/ui-store";

export interface HeaderMobileNavToggleProps {
  onToggle?: () => void;
}

/**
 * Self-contained mobile hamburger toggle and logo component.
 * Uses `useUIStore.toggleMobileSidebar` by default to avoid prop drilling.
 */
export function HeaderMobileNavToggle({ onToggle }: HeaderMobileNavToggleProps) {
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);

  const handleClick = () => {
    if (onToggle) {
      onToggle();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <div className="flex items-center gap-3 lg:hidden">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white cursor-pointer active:scale-95 transition-all"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Logo size="sm" />
    </div>
  );
}
