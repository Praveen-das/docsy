"use client";

import React from "react";
import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserMenuSignOutProps {
  onSignOut: () => void;
  className?: string;
}

/**
 * Reusable Sign Out button box for User Menu with glassmorphic styling and Clerk integration.
 * Matches desktop dropdown aesthetics identically.
 */
export function UserMenuSignOut({
  onSignOut,
  className,
}: UserMenuSignOutProps) {
  return (
    <div className={cn("relative z-10", className)}>
      <SignOutButton>
        <button
          type="button"
          onClick={onSignOut}
          className="group flex w-full min-h-[44px] sm:min-h-0 items-center gap-3 rounded-2xl border border-rose-500/15 bg-rose-500/[0.05] backdrop-blur-md px-4 py-2.5 text-[13.5px] font-medium text-[#f87171] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] transition-all duration-150 hover:bg-rose-500/[0.12] hover:border-rose-500/30 active:scale-[0.98] cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-[#f87171] stroke-[1.85] group-hover:translate-x-0.5 transition-transform shrink-0" />
          <span>Sign Out</span>
        </button>
      </SignOutButton>
    </div>
  );
}
