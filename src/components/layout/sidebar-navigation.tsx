"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, FileText, MessageSquare, Search, Settings, Zap, ArrowRight } from "lucide-react";

export interface SidebarNavigationProps {
  isCollapsed: boolean;
  onClose?: () => void;
  onOpenSearch?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  isSearch?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Conversations",
    href: "/conversations",
    icon: MessageSquare,
  },
  {
    label: "Search",
    href: "#search",
    icon: Search,
    isSearch: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function SidebarNavigation({
  isCollapsed,
  onClose,
  onOpenSearch,
}: SidebarNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto px-4 pt-2 pb-6">
      {/* Primary Navigation Menu matching Image */}
      <nav className="space-y-2 select-none">
        {NAV_ITEMS.map((item) => {
          const isHome = item.href === "/dashboard";
          const isActive =
            !item.isSearch &&
            (isHome
              ? pathname === "/dashboard" || pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href));

          const Icon = item.icon;

          if (item.isSearch) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  onClose?.();
                  onOpenSearch?.();
                }}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "group relative flex h-11 w-full items-center rounded-2xl text-xs font-medium transition-all duration-150 p-0 overflow-hidden cursor-pointer",
                  "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <div className="w-12 h-11 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-zinc-400 stroke-[1.75] group-hover:text-white transition-colors" />
                </div>
                {!isCollapsed && (
                  <span className="truncate pr-3 text-[14px] font-medium text-zinc-300 group-hover:text-white">
                    {item.label}
                  </span>
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "group relative flex h-13 items-center rounded-[22px] text-xs font-medium transition-all duration-150 p-0 w-full overflow-hidden cursor-pointer",
                isActive
                  ? "bg-gradient-to-r from-[#172044]/95 via-[#131a38]/90 to-[#0e1226]/85 text-white border border-[#3b4c8a]/50 shadow-[0_4px_30px_rgba(40,55,115,0.45),_inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <div className="w-13 h-13 flex items-center justify-center shrink-0">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors stroke-[1.75]",
                    isActive
                      ? "text-white"
                      : "text-zinc-400 group-hover:text-white"
                  )}
                />
              </div>

              {!isCollapsed && (
                <span
                  className={cn(
                    "truncate pr-4 text-[14px]",
                    isActive ? "font-semibold text-white tracking-tight" : "font-medium text-zinc-300 group-hover:text-white"
                  )}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade to Pro Card at bottom matching Image 1 */}
      {!isCollapsed ? (
        <div className="mt-8 rounded-[26px] border border-white/[0.08] bg-gradient-to-b from-[#111322] to-[#0c0d17] p-5 relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient violet glow */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

          {/* Glowing Purple Lightning Bolt Icon */}
          <div className="flex items-center justify-start mb-3">
            <Zap className="h-5 w-5 text-[#c084fc] fill-[#c084fc] drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]" />
          </div>

          <div className="space-y-1">
            <h4 className="text-[13.5px] font-semibold text-white tracking-tight">Upgrade to Pro</h4>
            <p className="text-[11.5px] text-zinc-400 leading-snug">
              More documents.<br />
              Higher limits.<br />
              Unlock more.
            </p>
          </div>

          {/* Circular Arrow Button on bottom-right */}
          <div className="flex justify-end mt-2">
            <Link
              href="/settings"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e2238] border border-white/10 text-zinc-200 hover:text-white hover:bg-[#2a304e] hover:border-white/25 transition-all cursor-pointer shadow-md"
              title="View Pro Plans"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Collapsed Upgrade Icon */
        <div className="mt-auto flex justify-center py-2">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-950/50 border border-purple-500/30 text-purple-400 hover:bg-purple-900/50 transition-colors shadow-[0_0_12px_rgba(168,85,247,0.25)]"
            title="Upgrade to Pro"
          >
            <Zap className="h-4 w-4 fill-purple-400" />
          </Link>
        </div>
      )}
    </div>
  );
}
