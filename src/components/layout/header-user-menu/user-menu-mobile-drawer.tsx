"use client";

import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenuContent } from "./user-menu-content";
import type { UserMenuProfileInfo } from "./types";

export interface UserMenuMobileDrawerProps {
  isOpen: boolean;
  mounted: boolean;
  drawerRef: React.RefObject<HTMLDivElement | null>;
  profile: UserMenuProfileInfo;
  onClose: () => void;
}

/**
 * Mobile right-side slide-over sidebar drawer portaled to document.body.
 * Shares the exact same Obsidian glassmorphic design and structure as UserMenuDesktopDropdown.
 */
export function UserMenuMobileDrawer({ isOpen, mounted, drawerRef, profile, onClose }: UserMenuMobileDrawerProps) {
  if (!isOpen || !mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="sm:hidden fixed inset-0 z-50 select-none">
      {/* Darkened Backdrop Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      />

      {/* Right Sidebar Slide-Over Drawer Panel */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="User Account Menu"
        className={cn(
          "user-menu-glow fixed top-0 bottom-0 right-0 z-50 flex flex-col",
          "w-72 xs:w-80 max-w-[85vw] h-full max-h-[100dvh]",
          "bg-(--tile-bg) backdrop-blur-2xl backdrop-saturate-150",
          "p-3.5",
          "animate-in slide-in-from-right duration-250 ease-out overflow-hidden shadow-2xl",
        )}
      >
        {/* Ambient Cosmic Diffuse Glow inside the Glass Sheet */}
        <div
          aria-hidden="true"
          className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10 opacity-30"
        />
        <div
          aria-hidden="true"
          className="absolute top-10 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10 opacity-20"
        />

        {/* Minimalist Close Button aligned cleanly at the top */}
        <div className="flex items-center justify-end pb-1 shrink-0 relative z-20">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account menu"
            className="p-1.5 -mr-1 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors active:scale-95 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content matching Desktop Dropdown identically */}
        <div className="overflow-y-auto custom-scrollbar flex-1 flex flex-col min-h-0">
          <UserMenuContent profile={profile} onClose={onClose} isDrawer />
        </div>
      </aside>
    </div>,
    document.body,
  );
}
