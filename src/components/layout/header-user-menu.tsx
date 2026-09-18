"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeaderUserMenuProps {
  className?: string;
}

/**
 * Self-contained user profile pill and dropdown menu matching reference design.
 * Handles Clerk auth state, outside clicks, keyboard accessibility, and user initials fallback.
 */
export function HeaderUserMenu({ className }: HeaderUserMenuProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/5 cursor-pointer select-none border border-transparent hover:border-white/10"
      >
        {/* Circle Initials Avatar: Clean outline circle with subtle background and crisp initials */}
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#374161] bg-[#141829] text-[13px] font-medium text-[#c4cbdd] shadow-sm select-none">
            {userInitials}
          </div>
        )}

        <span className="hidden sm:inline-block font-medium text-[14px] text-[#e2e8f0] truncate max-w-[140px]">
          {displayName}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#7e8ba6] transition-transform duration-200 stroke-[2]",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* User Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-52 rounded-xl border border-white/10 bg-[#12141e]/90 p-1.5 shadow-xl shadow-black/40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-white/5 mb-1">
            <p className="text-xs font-semibold text-white truncate">{displayName}</p>
            <p className="text-[11px] text-zinc-400 truncate">
              {user?.primaryEmailAddress?.emailAddress || "user@docsy.ai"}
            </p>
          </div>

          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Settings className="h-3.5 w-3.5 text-zinc-400" />
            <span>Account Settings</span>
          </Link>

          <div className="my-1 border-t border-white/5" />

          <SignOutButton>
            <button
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </SignOutButton>
        </div>
      )}
    </div>
  );
}
