"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { UserMenuDesktopDropdown } from "@/components/layout/header-user-menu/user-menu-desktop-dropdown";
import type { UserMenuProfileInfo } from "@/components/layout/header-user-menu/types";
import { UserMenuMobileDrawer } from "@/components/layout/header-user-menu/user-menu-mobile-drawer";
import { UserMenuTrigger } from "@/components/layout/header-user-menu/user-menu-trigger";

export interface HeaderUserMenuProps {
  className?: string;
}

/**
 * Self-contained user profile pill and navigation menu matching Docsy Obsidian design.
 * - On desktop viewports (>= 640px), renders an ultra-premium glassmorphic floating dropdown.
 * - On small screen devices (< 640px), morphs into a right-side slide-over sidebar drawer.
 *
 * Modular architecture:
 * - `UserMenuTrigger`: Header avatar pill button with status & chevrons
 * - `UserMenuProfileCard`: Avatar, name, email, and subscription plan badge
 * - `UserMenuNavList`: Primary preferences and secondary support links
 * - `UserMenuSignOut`: Glassmorphic Clerk sign-out action button
 * - `UserMenuDesktopDropdown`: Desktop floating dropdown panel
 * - `UserMenuMobileDrawer`: Portaled right-side slide-over drawer
 */
export function HeaderUserMenu({ className }: HeaderUserMenuProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);

  const profile: UserMenuProfileInfo = useMemo(() => {
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

    return {
      displayName,
      userEmail,
      userInitials,
      imageUrl: user?.imageUrl,
      planName: "Pro Plan",
    };
  }, [user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background body scroll when mobile drawer is open
  useEffect(() => {
    if (!isOpen) return;

    if (window.innerWidth < 640) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close menu on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (menuRef.current && menuRef.current.contains(target)) ||
        (mobileDrawerRef.current && mobileDrawerRef.current.contains(target))
      ) {
        return;
      }
      setIsOpen(false);
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

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        // Close left sidebar on small screens to prevent competing overlays
        setMobileSidebarOpen(false);
      }
      return next;
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Transparent Backdrop to dismiss floating dropdown on outside click */}
      {isOpen && (
        <div aria-hidden="true" onClick={handleClose} className="hidden sm:block fixed inset-0 z-40 bg-transparent" />
      )}

      {/* Main Anchor Container */}
      <div ref={menuRef} className={cn("relative z-50", className)}>
        {/* Trigger Pill Button */}
        <UserMenuTrigger profile={profile} isOpen={isOpen} onToggle={handleToggle} />

        {/* Desktop Floating Dropdown */}
        {isOpen && <UserMenuDesktopDropdown profile={profile} onClose={handleClose} />}
      </div>

      {/* Mobile Right-Side Slide-Over Drawer */}
      <UserMenuMobileDrawer
        isOpen={isOpen}
        mounted={mounted}
        drawerRef={mobileDrawerRef}
        profile={profile}
        onClose={handleClose}
      />
    </>
  );
}

export * from "./header-user-menu";
