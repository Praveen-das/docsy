"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  ChevronDown,
  User,
  FileText,
  Settings,
  BarChart3,
  HelpCircle,
  MessageSquare,
  ChevronRight,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowContainer } from "@/components/ui/glow-container";

export interface HeaderUserMenuProps {
  className?: string;
}

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const mainMenuItems: MenuItem[] = [
  {
    label: "My Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Preferences",
    href: "/preferences",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Usage & Billing",
    href: "/billing",
    icon: BarChart3,
  },
];

const secondaryMenuItems: MenuItem[] = [
  {
    label: "Help & Support",
    href: "/support",
    icon: HelpCircle,
  },
  {
    label: "Send Feedback",
    href: "/feedback",
    icon: MessageSquare,
  },
];

/**
 * Self-contained user profile pill and dropdown menu matching reference design.
 * Styled with Obsidian dark mode, glassmorphic backdrop, subtle glow, and crisp navigation items.
 */
export function HeaderUserMenu({ className }: HeaderUserMenuProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.fullName || user?.firstName || "Praveen Das";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "praveen@docsy.app";
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
    <>
      {/* Transparent Fullscreen Backdrop to block background interactions while menu is open */}
      {isOpen && (
        <div aria-hidden="true" onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 bg-transparent" />
      )}

      <div ref={menuRef} className={cn("relative z-50", className)}>
        {/* Trigger Button: Minimalist Avatar | Username and Plan Aligned Vertically */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={cn(
            "group flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-2.5 transition-all duration-150 cursor-pointer select-none",
            "active:scale-[0.98]",
            isOpen && "bg-white/[0.06] border-white/[0.1]",
          )}
        >
          {/* Minimalist Avatar */}
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#171a2a] to-[#0f121d] text-[12.5px] font-semibold text-[#c7d2fe] shadow-inner select-none">
              {userInitials}
            </div>
          )}

          {/* Username & Plan Aligned Vertically */}
          <div className="hidden sm:flex flex-col items-start text-left leading-none gap-1">
            <span className="text-[13px] font-medium text-[#e2e8f0] group-hover:text-white transition-colors truncate max-w-[130px]">
              {displayName}
            </span>
            <span className="text-[11px] font-medium text-[#818ea8] group-hover:text-[#a5b4fc] transition-colors">
              Pro Plan
            </span>
          </div>

          {/* Subtle Chevron */}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-[#7e8ba6] group-hover:text-zinc-200 transition-transform duration-200 stroke-[2] ml-0.5",
              isOpen && "rotate-180 text-white",
            )}
          />
        </button>

        {/* User Dropdown Menu with Ultra-Premium Glassmorphism & Active Nav Glow Edge */}
        {isOpen && (
          <GlowContainer className="absolute right-0 mt-2.5 z-50 w-[312px] will-change-transform animate-in fade-in zoom-in-95 duration-150">
            {/* Header Profile Section */}
            <div className="flex items-center gap-3.5 px-2.5 py-2 relative z-10">
              {/* Avatar Circle with Frosted Glass Ring */}
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
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
                    Pro Plan
                  </span>
                </div>
              </div>
            </div>

            {/* Frosted Hairline Divider */}
            <div className="my-2.5 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Main Navigation Items */}
            <div className="space-y-0.5 relative z-10">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-[#8f9bb3] transition-colors duration-150 hover:bg-white/[0.05] hover:text-[#f8fafc] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className="h-[18px] w-[18px] text-[#828ea7] group-hover:text-[#c7d2fe] stroke-[1.85] transition-colors" />
                      <span className="tracking-normal">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#4a5268] group-hover:text-[#94a3b8] transition-colors stroke-[2]" />
                  </Link>
                );
              })}
            </div>

            {/* Frosted Hairline Divider */}
            <div className="my-2.5 h-px w-full bg-white/[0.06]" />

            {/* Secondary Support Items */}
            <div className="space-y-0.5 relative z-10">
              {secondaryMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-[#8f9bb3] transition-colors duration-150 hover:bg-white/[0.05] hover:text-[#f8fafc] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className="h-[18px] w-[18px] text-[#828ea7] group-hover:text-[#c7d2fe] stroke-[1.85] transition-colors" />
                      <span className="tracking-normal">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#4a5268] group-hover:text-[#94a3b8] transition-colors stroke-[2]" />
                  </Link>
                );
              })}
            </div>

            {/* Bottom Destructive Sign Out Button Box (Glassmorphic) */}
            <div className="mt-3 relative z-10">
              <SignOutButton>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-rose-500/15 bg-rose-500/[0.05] backdrop-blur-md px-4 py-2.5 text-[13.5px] font-medium text-[#f87171] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] transition-all duration-150 hover:bg-rose-500/[0.12] hover:border-rose-500/30 active:scale-[0.98] cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-[#f87171] stroke-[1.85] group-hover:translate-x-0.5 transition-transform" />
                  <span>Sign Out</span>
                </button>
              </SignOutButton>
            </div>
          </GlowContainer>
        )}
      </div>
    </>
  );
}
