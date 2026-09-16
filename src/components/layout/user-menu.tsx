"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export interface UserMenuProps {
  isCollapsed: boolean;
  onClose?: () => void;
}

export function UserMenu({ isCollapsed, onClose }: UserMenuProps) {
  const { user, isLoaded } = useUser();

  const displayName = user?.fullName || user?.firstName || "Praveen Das";
  const userInitials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "PD";

  if (!isLoaded) {
    return (
      <div className="px-3 py-3 border-t border-white/[0.06] bg-[#08090d]">
        <div className="h-9 w-full animate-pulse rounded-xl bg-white/5" />
      </div>
    );
  }

  return (
    <div className="px-3 py-2.5 border-t border-white/[0.06] bg-[#08090d] select-none flex items-center justify-between gap-2">
      {/* User profile link */}
      <Link
        href="/settings"
        onClick={onClose}
        title="View Account Settings"
        className="flex items-center gap-2.5 rounded-xl transition-colors hover:bg-white/5 p-1 min-w-0 flex-1"
      >
        {/* Avatar badge */}
        <div className="relative shrink-0">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-900/60 to-indigo-950/80 text-[11px] font-bold text-purple-200 border border-purple-500/30">
              {userInitials}
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="truncate text-left min-w-0">
            <p className="text-xs font-semibold text-zinc-200 truncate leading-tight hover:text-white transition-colors">
              {displayName}
            </p>
          </div>
        )}
      </Link>

      {/* Sun / Theme Switcher on Right matching Image 2 */}
      {!isCollapsed && (
        <div className="shrink-0">
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}
