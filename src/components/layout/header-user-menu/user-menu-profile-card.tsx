"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { UserMenuProfileInfo } from "./types";

export interface UserMenuProfileCardProps {
  profile: UserMenuProfileInfo;
  className?: string;
}

/**
 * Reusable user profile header card displaying avatar, name, email, and subscription tier badge.
 * Matches HeaderUserMenu reference aesthetics exactly.
 */
export function UserMenuProfileCard({
  profile,
  className,
}: UserMenuProfileCardProps) {
  const { displayName, userEmail, userInitials, imageUrl, planName = "Pro Plan" } = profile;

  return (
    <div className={cn("flex items-center gap-3.5 px-2.5 py-2 relative z-10", className)}>
      {/* Avatar Circle with Frosted Glass Ring */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={displayName}
          className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white/15 shadow-md shadow-black/40"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#1c2237] to-[#121626] border border-white/15 text-[18px] font-semibold text-[#d6dcfa] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.3)] select-none">
          {userInitials}
        </div>
      )}

      {/* User Meta Info */}
      <div className="min-w-0 flex-1">
        <h4 className="text-[15px] font-semibold text-[#f1f3f9] truncate tracking-tight leading-tight drop-shadow-xs">
          {displayName}
        </h4>
        <p className="text-[12.5px] text-[#8e98b0] truncate mt-0.5 font-normal">{userEmail}</p>
        <div className="mt-2 flex items-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-[#b8c5e6]">
            {planName}
          </span>
        </div>
      </div>
    </div>
  );
}
