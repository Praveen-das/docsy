"use client";

import React from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HeaderSearchBar } from "./header-search-bar";
import { HeaderUserMenu } from "./header-user-menu";
import { HeaderMobileNavToggle } from "./header-mobile-nav-toggle";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenSearch?: () => void;
  title?: string;
  className?: string;
}

/**
 * Top Application Header matching the reference aesthetic:
 * Transparent, borderless obsidian layout composed of modular, self-contained subcomponents.
 *
 * Employs an 8-layer progressive backdrop blur for fluid, natural optical gradient decay
 * as content scrolls behind the header.
 *
 * Submodules:
 * - `HeaderMobileNavToggle`: Mobile drawer hamburger & brand logo
 * - `HeaderSearchBar`: Search pill with Ctrl+K shortcut & store trigger
 * - `ThemeToggle (variant="minimal")`: Subtle sun toggle
 * - `HeaderUserMenu`: Avatar, displayName, and account settings dropdown
 */
export function Header({ onToggleSidebar, onOpenSearch, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 -mb-10 z-30 flex h-20 shrink-0 w-full items-center justify-between px-6 sm:px-7",
        "bg-transparent transition-colors isolate",
        className,
      )}
    >
      {/* 8-layer Progressive Backdrop Blur */}
      <ProgressiveBlur height={100} />

      {/* Mobile Navigation Toggle */}
      <HeaderMobileNavToggle onToggle={onToggleSidebar} />

      {/* Center Search Pill */}
      <HeaderSearchBar onOpen={onOpenSearch} />

      {/* Right Controls: Theme Switcher & User Profile Pill */}
      <div className="flex items-center gap-5 sm:gap-6 shrink-0">
        <ThemeToggle variant="minimal" className="text-[#94a3b8] hover:text-white" />
        <HeaderUserMenu />
      </div>
    </header>
  );
}

export { HeaderSearchBar } from "./header-search-bar";
export { HeaderUserMenu } from "./header-user-menu";
export { HeaderMobileNavToggle } from "./header-mobile-nav-toggle";
