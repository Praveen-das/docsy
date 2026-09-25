"use client";

import React from "react";
import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

interface ProfileHeaderProps {
  displayName: string;
  displayEmail: string;
  userInitials: string;
  imageUrl?: string | null;
}

export function ProfileHeader({
  displayName,
  displayEmail,
  userInitials,
  imageUrl,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 text-indigo-200 flex items-center justify-center font-bold text-sm border border-indigo-500/25">
              {userInitials}
            </div>
          )}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#090b10]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-medium text-zinc-100 truncate">{displayName}</span>
          </div>
          <p className="text-[12px] text-zinc-500 truncate mt-0.5">{displayEmail}</p>
        </div>
      </div>

      <SignOutButton>
        <button
          type="button"
          className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-xs font-medium transition-colors active:scale-[0.98] cursor-pointer shrink-0"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </SignOutButton>
    </div>
  );
}
