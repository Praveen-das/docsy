"use client";

import React from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export interface UserMenuProps {
  isCollapsed: boolean;
  onClose?: () => void;
}

export function UserMenu({ isCollapsed, onClose }: UserMenuProps) {
  const { user, isLoaded } = useUser();

  const displayName = user?.fullName || user?.firstName || "User";
  const displayEmail =
    user?.primaryEmailAddress?.emailAddress || "";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!isLoaded) {
    return (
      <div className="px-3.5 py-3 border-t border-zinc-200 bg-[#fafafa] dark:border-white/5 dark:bg-[#0e0e12]">
        <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="px-3.5 py-3 border-t border-zinc-200 bg-[#fafafa] overflow-hidden dark:border-white/5 dark:bg-[#0e0e12]">
      <Link
        href="/settings"
        onClick={onClose}
        title="View Account Settings"
        className="flex items-center rounded-lg transition-colors group p-0 hover:bg-zinc-200/50 border-0 h-10 w-full overflow-hidden dark:hover:bg-white/5"
      >
        {/* Pinned 40px Avatar Anchor */}
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <div className="relative shrink-0">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover border border-zinc-300/60 dark:border-white/5"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-zinc-200 text-zinc-800 flex items-center justify-center font-bold text-xs shadow-2xs border border-zinc-300/60 dark:bg-zinc-800 dark:text-white dark:border-white/5">
                {userInitials}
              </div>
            )}
            {/* Active Status Beacon */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#fafafa] dark:ring-[#0e0e12]" />
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex items-center justify-between min-w-0 flex-1 pr-3">
            <div className="truncate text-left min-w-0">
              <p className="text-xs font-semibold text-zinc-800 truncate leading-tight group-hover:text-black dark:text-zinc-200 dark:group-hover:text-white transition-colors">
                {displayName}
              </p>
              <p className="text-[11px] text-zinc-500 truncate leading-tight mt-0.5">
                {displayEmail}
              </p>
            </div>

            <Settings className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors shrink-0 ml-1.5" />
          </div>
        )}
      </Link>
    </div>
  );
}
