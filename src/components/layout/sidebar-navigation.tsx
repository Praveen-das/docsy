"use client";

import { useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";

import { NavHomeIcon, NavDocumentsIcon } from "./sidebar-nav-icons";
import { SidebarNavItem } from "./sidebar-nav-item";
import { SidebarUpgradeCard } from "./sidebar-upgrade-card";
import { SidebarRecents } from "./sidebar-recents";
import { useSlidingNav } from "./use-sliding-nav";
import type { NavItem, SidebarNavigationProps } from "./sidebar-navigation.types";
import { useUser } from "@clerk/nextjs";
import { useSubscription } from "@/features/billing/use-subscription";

export type { SidebarNavigationProps } from "./sidebar-navigation.types";

const NAV_ITEMS: NavItem[] = [
  {
    label: "Start New",
    href: "/dashboard",
    icon: NavHomeIcon,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: NavDocumentsIcon,
  },
];

export function SidebarNavigation({ isCollapsed, onClose, onOpenSearch }: SidebarNavigationProps) {
  const { data: subscription, isLoading } = useSubscription();

  const pathname = usePathname();
  const openSearch = useUIStore((state) => state.openSearch);

  const isProUser = subscription?.plan === "pro";

  // Determine active item from current route
  const activeHref = useMemo(() => {
    if (!pathname) return "/dashboard";
    if (pathname === "/dashboard" || pathname === "/") return "/dashboard";
    if (pathname.startsWith("/documents")) return "/documents";
    if (pathname.startsWith("/conversations")) return "/conversations";
    return null;
  }, [pathname]);

  // Optimistic active key for instant 0ms latency on click
  // Auto-resolve optimistic href if route has caught up
  const currentActiveHref = activeHref;

  // Hook managing sliding indicator metrics and resize observation
  const { navRef, registerItemRef } = useSlidingNav({
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
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden  pt-4 pb-5 gap-3">
      {/* Primary Navigation Menu with Sliding Pill Indicator */}
      <nav ref={navRef} className="relative px-2 space-y-2 select-none shrink-0" aria-label="Sidebar Navigation">
        {/* Hardware-Accelerated Sliding Indicator Pills */}
        {/* <SidebarNavPills
          activeRect={activeRect}
          isReady={isReady}
          prefersReducedMotion={prefersReducedMotion}
          isCollapsed={isCollapsed}
          isActive={Boolean(currentActiveHref)}
        /> */}

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

      {/* Recents Section (scrollable) */}
      <SidebarRecents isCollapsed={isCollapsed} onClose={onClose} />

      {/* Upgrade to Pro Card */}
      {!isProUser && (
        <div className="shrink-0 px-3.5">
          <SidebarUpgradeCard isCollapsed={isCollapsed} onClose={onClose} />
        </div>
      )}
    </div>
  );
}
