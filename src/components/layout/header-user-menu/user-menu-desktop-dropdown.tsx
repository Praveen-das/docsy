"use client";

import React from "react";
import { GlowContainer } from "@/components/ui/glow-container";
import { UserMenuContent } from "./user-menu-content";
import type { UserMenuProfileInfo } from "./types";

export interface UserMenuDesktopDropdownProps {
  profile: UserMenuProfileInfo;
  onClose: () => void;
}

/**
 * Desktop floating dropdown menu anchored below header trigger.
 * Built with GlowContainer, frosted dividers, and Obsidian dark mode.
 */
export function UserMenuDesktopDropdown({
  profile,
  onClose,
}: UserMenuDesktopDropdownProps) {
  return (
    <div className="hidden sm:block">
      <GlowContainer className="absolute right-0 mt-2.5 z-50 w-[312px] will-change-transform animate-in fade-in zoom-in-95 duration-150">
        <UserMenuContent profile={profile} onClose={onClose} />
      </GlowContainer>
    </div>
  );
}
