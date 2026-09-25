"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { UserMenuProfileInfo } from "./types";

export interface UserMenuTriggerProps {
  profile: UserMenuProfileInfo;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Header avatar pill trigger that toggles the user menu dropdown / mobile drawer.
 * Supports image avatar with fallback stylized initials.
 */
export function UserMenuTrigger({ profile, isOpen, onToggle, className }: UserMenuTriggerProps) {
  const { displayName, imageUrl, userInitials, planName = "Pro Plan" } = profile;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-haspopup="true"
      aria-label="User Account Menu"
      className={cn(
        "group flex items-center gap-2.5 sm:gap-3 rounded-full p-1 sm:py-1.5 sm:pl-1.5 sm:pr-2.5 transition-all duration-150 cursor-pointer select-none",
        "active:scale-[0.98] min-h-[36px] sm:min-h-[44px]",
        isOpen && "bg-white/[0.06] border-white/[0.1]",
        className,
      )}
    >
      {/* Minimalist Avatar - Responsive sizing for small screens */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={displayName}
          className="h-7.5 w-7.5 sm:h-9 sm:w-9 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-7.5 w-7.5 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#171a2a] to-[#0f121d] text-[11px] sm:text-[12.5px] font-semibold text-[#c7d2fe] shadow-inner select-none">
          {userInitials}
        </div>
      )}

      {/* Username & Plan Aligned Vertically (Visible on Desktop) */}
      <div className="hidden sm:flex flex-col items-start text-left leading-none gap-1">
        <span className="text-[13px] font-medium text-[#e2e8f0] group-hover:text-white transition-colors truncate max-w-[130px]">
          {displayName}
        </span>
        <span className="text-[11px] font-medium text-[#818ea8] group-hover:text-[#a5b4fc] transition-colors">
          {planName}
        </span>
      </div>
    </button>
  );
}
