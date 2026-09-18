"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";

import {
  NavHomeIcon,
  NavDocumentsIcon,
  NavConversationsIcon,
  NavSearchIcon,
  NavSettingsIcon,
} from "./sidebar-nav-icons";
import { SidebarNavItem } from "./sidebar-nav-item";
import { SidebarNavPills } from "./sidebar-nav-pills";
import { SidebarUpgradeCard } from "./sidebar-upgrade-card";
import { useSlidingNav } from "./use-sliding-nav";
import type { NavItem, SidebarNavigationProps } from "./sidebar-navigation.types";
import Link from "next/link";

export type { SidebarNavigationProps } from "./sidebar-navigation.types";

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: NavHomeIcon,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: NavDocumentsIcon,
  },
  {
    label: "Conversations",
    href: "/conversations",
    icon: NavConversationsIcon,
  },
  {
    label: "Search",
    href: "#search",
    icon: NavSearchIcon,
    isSearch: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: NavSettingsIcon,
  },
];

export function SidebarNavigation({ isCollapsed, onClose, onOpenSearch }: SidebarNavigationProps) {
  const pathname = usePathname();
  const openSearch = useUIStore((state) => state.openSearch);

  // Determine active item from current route
  const activeHref = useMemo(() => {
    if (!pathname) return "/dashboard";
    if (pathname === "/dashboard" || pathname === "/") return "/dashboard";
    if (pathname.startsWith("/documents")) return "/documents";
    if (pathname.startsWith("/conversations")) return "/conversations";
    if (pathname.startsWith("/settings")) return "/settings";
    return null;
  }, [pathname]);

  // Optimistic active key for instant 0ms latency on click
  // Auto-resolve optimistic href if route has caught up
  const currentActiveHref = activeHref;

  // Hook managing sliding indicator metrics and resize observation
  const { navRef, registerItemRef, activeRect, isReady, prefersReducedMotion } = useSlidingNav({
    activeHref: currentActiveHref,
    isCollapsed,
  });

  const handleItemSelect = useCallback(
    (item: NavItem) => {
      if (item.isSearch) {
        onClose?.();
        if (onOpenSearch) {
          onOpenSearch();
        } else {
          openSearch();
        }
        return;
      }

      onClose?.();
    },
    [onClose, onOpenSearch, openSearch],
  );

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto px-3.5 pt-4 pb-5">
      {/* Primary Navigation Menu with Sliding Pill Indicator */}
      <nav ref={navRef} className="relative space-y-2 select-none" aria-label="Sidebar Navigation">
        {/* Hardware-Accelerated Sliding Indicator Pills */}
        <SidebarNavPills
          activeRect={activeRect}
          isReady={isReady}
          prefersReducedMotion={prefersReducedMotion}
          isCollapsed={isCollapsed}
          isActive={Boolean(currentActiveHref)}
        />

        {/* Navigation Items */}
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.label}
            item={item}
            isActive={currentActiveHref === item.href}
            isCollapsed={isCollapsed}
            onSelect={handleItemSelect}
            refCallback={registerItemRef(item.href)}
          />
        ))}
      </nav>

      {/* Upgrade to Pro Card */}
      <SidebarUpgradeCard isCollapsed={isCollapsed} onClose={onClose} />
    </div>
  );
}
