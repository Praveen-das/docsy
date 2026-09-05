"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, MessageSquare } from "lucide-react";

export interface SidebarNavigationProps {
  isCollapsed: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  matchPrefixes?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Conversations",
    href: "/conversations",
    icon: MessageSquare,
    matchPrefixes: ["/conversations", "/conversation"],
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
    badge: "4",
  },
];

export function SidebarNavigation({
  isCollapsed,
  onClose,
}: SidebarNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="flex-1 overflow-y-auto px-3.5 pt-2 pb-3 space-y-4">
      <div className="space-y-0.5">
        {!isCollapsed && (
          <div className="px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Workspace
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.matchPrefixes &&
              item.matchPrefixes.some((p) => pathname.startsWith(p))) ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "group relative flex h-9 items-center rounded-md text-[13px] font-medium transition-colors select-none tracking-[-0.01em] p-0 w-full overflow-hidden",
                isActive
                  ? "text-zinc-900 font-semibold bg-transparent dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/60 active:bg-zinc-200/50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/[0.04] dark:active:bg-white/[0.07]"
              )}
            >
              {/* Pinned 40px Icon Anchor: X=34px Center */}
              <div className="w-10 h-9 flex items-center justify-center shrink-0">
                <Icon
                  className={cn(
                    "h-[17px] w-[17px] shrink-0 transition-colors",
                    isActive
                      ? "text-zinc-900 dark:text-white"
                      : "text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                  )}
                />
              </div>

              {/* Label & Badge: Hidden when collapsed */}
              {!isCollapsed && (
                <div className="flex items-center justify-between min-w-0 flex-1 pr-3">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-mono font-medium shrink-0 ml-1.5 leading-none",
                        isActive
                          ? "bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:text-zinc-300"
                          : "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-500"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Micro-dot badge indicator when collapsed */}
              {isCollapsed && item.badge && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-zinc-900 ring-2 ring-[#fafafa] dark:bg-white dark:ring-[#0e0e12]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
