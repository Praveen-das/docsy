"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { UserMenuProfileCard } from "./user-menu-profile-card";
import { UserMenuNavList } from "./user-menu-nav-list";
import { UserMenuSignOut } from "./user-menu-sign-out";
import { MAIN_MENU_ITEMS, SECONDARY_MENU_ITEMS, type UserMenuProfileInfo } from "./types";

export interface UserMenuContentProps {
  profile: UserMenuProfileInfo;
  onClose: () => void;
  className?: string;
  isDrawer?: boolean;
}

/**
 * Shared menu content between Desktop Dropdown and Mobile Drawer.
 * Guarantees 100% visual and functional consistency across all device sizes.
 */
export function UserMenuContent({
  profile,
  onClose,
  className,
  isDrawer = false,
}: UserMenuContentProps) {
  return (
    <div className={cn("flex flex-col relative z-10", className)}>
      {/* Header Profile Section */}
      <UserMenuProfileCard profile={profile} />

      {/* Frosted Hairline Divider */}
      <div className="my-2.5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Main Navigation Items */}
      <UserMenuNavList items={MAIN_MENU_ITEMS} onSelect={onClose} />

      {/* Frosted Hairline Divider */}
      <div className="my-2.5 h-px w-full bg-white/[0.06]" />

      {/* Secondary Support Items */}
      <UserMenuNavList items={SECONDARY_MENU_ITEMS} onSelect={onClose} />

      {/* Bottom Destructive Sign Out Button Box */}
      <div className={cn(isDrawer ? "mt-auto pt-3.5" : "mt-3")}>
        <UserMenuSignOut onSignOut={onClose} />
      </div>
    </div>
  );
}
