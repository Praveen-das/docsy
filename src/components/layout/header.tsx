"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Search, ChevronDown, Menu, Sun, Moon, LogOut, Settings, User } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenSearch?: () => void;
  title?: string;
  className?: string;
}

export function Header({
  onToggleSidebar,
  onOpenSearch,
  title,
  className,
}: HeaderProps) {
  const { user } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 w-full items-center justify-between px-4 sm:px-8",
        "border-b border-white/[0.06] bg-[#08090d]/80 backdrop-blur-md transition-colors",
        className
      )}
    >
      {/* Left: Mobile Sidebar Toggle / Optional Brand Mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden cursor-pointer active:scale-95 transition-all"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
      </div>

      {/* Center/Left Search Bar matching Image 1: "Search documents, conversations..." [Ctrl K] */}
      <div className="flex-1 max-w-md mx-2 sm:mx-0">
        <div
          onClick={onOpenSearch}
          className="group relative flex h-10 w-full items-center justify-between rounded-xl border border-white/[0.08] bg-[#10121a]/90 px-3.5 text-xs text-zinc-300 shadow-sm transition-all hover:border-white/15 focus-within:border-indigo-500/50 cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Search className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors shrink-0" />
            <span className="truncate text-zinc-400 select-none text-[13px]">
              Search documents, conversations...
            </span>
          </div>

          <kbd className="hidden sm:inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-zinc-400 shadow-2xs select-none">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right: Theme Switcher & User Profile Dropdown Pill */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Theme Toggle Sun Icon */}
        <ThemeToggle />

        {/* User Profile Pill matching Image 1 */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/5 cursor-pointer select-none border border-transparent hover:border-white/10"
          >
            {/* Circle Initials Avatar */}
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-900/60 to-indigo-950/80 text-[11px] font-bold text-purple-200 border border-purple-500/30 shadow-inner">
                {userInitials}
              </div>
            )}

            <span className="hidden sm:inline-block font-semibold text-sm text-zinc-200 truncate max-w-[130px]">
              {displayName}
            </span>

            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-zinc-400 transition-transform duration-150",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 z-50 w-52 rounded-xl border border-white/10 bg-[#12141e] p-1.5 shadow-xl shadow-black/40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {user?.primaryEmailAddress?.emailAddress || "user@docsy.ai"}
                  </p>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Account Settings</span>
                </Link>

                <div className="my-1 border-t border-white/5" />

                <SignOutButton>
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign out</span>
                  </button>
                </SignOutButton>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
