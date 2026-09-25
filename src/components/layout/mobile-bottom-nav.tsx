"use client";

import React, { useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavHomeIcon, NavDocumentsIcon, NavConversationsIcon, NavSettingsIcon } from "./sidebar-nav-icons";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hide mobile bottom navigation bar in active chat/conversation view to maximize typing space
  const isChatView =
    pathname === "/conversation" ||
    pathname.startsWith("/conversation/") ||
    pathname === "/chat" ||
    pathname.startsWith("/chat/");

  const isSettingsOpen = Boolean(searchParams.get("settings"));

  const activeTab = useMemo(() => {
    if (isSettingsOpen) return "settings";
    if (!pathname) return "home";
    if (pathname === "/dashboard" || pathname === "/") return "home";
    if (pathname.startsWith("/documents")) return "documents";
    if (pathname.startsWith("/conversations")) return "conversations";
    return null;
  }, [pathname, isSettingsOpen]);

  const handleOpenSettings = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      params.set("settings", "general");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  if (isChatView) {
    return null;
  }

  const navItems = [
    {
      id: "home",
      label: "Home",
      href: "/dashboard",
      icon: NavHomeIcon,
      onClick: undefined,
    },
    {
      id: "documents",
      label: "Documents",
      href: "/documents",
      icon: NavDocumentsIcon,
      onClick: undefined,
    },
    {
      id: "conversations",
      label: "Conversations",
      href: "/conversations",
      icon: NavConversationsIcon,
      onClick: undefined,
    },
    {
      id: "settings",
      label: "Settings",
      href: "?settings=account",
      icon: NavSettingsIcon,
      onClick: handleOpenSettings,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden items-center justify-around px-2 pt-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] bg-[#08090d]/92 backdrop-blur-xl border-t border-white/[0.08] select-none shadow-[0_-8px_24px_rgba(0,0,0,0.5)] will-change-transform"
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={item.onClick}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors cursor-pointer group relative",
              isActive ? "text-[#a5b4fc]" : "text-[#7e8ba6] hover:text-[#c7d2fe]",
            )}
          >
            <div className="relative flex items-center justify-center h-5 w-5 mb-1">
              <Icon
                className={cn(
                  "h-5 w-5 stroke-[1.9] transition-transform duration-150 group-active:scale-90",
                  isActive ? "text-[#818cf8]" : "text-[#7e8ba6]",
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10.5px] font-medium leading-none tracking-tight transition-colors",
                isActive ? "text-[#c7d2fe] font-semibold" : "text-[#7e8ba6]",
              )}
            >
              {item.label}
            </span>

            {/* Glowing active purple dot beneath the label */}
            {isActive ? (
              <span className="h-1 w-1 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)] mt-1" />
            ) : (
              <span className="h-1 w-1 mt-1 opacity-0" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
