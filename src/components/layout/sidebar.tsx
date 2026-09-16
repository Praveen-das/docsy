"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNavigation } from "./sidebar-navigation";
import { ConversationSidebar } from "./conversation-sidebar";

// Module-scoped hydration flag: persists across client-side Next.js route transitions
let isAppHydrated = false;

function ConversationSidebarWithDoc({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose?: () => void;
}) {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("doc");
  return <ConversationSidebar isOpen={isOpen} onClose={onClose} documentId={documentId} />;
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenUpload?: () => void;
  onOpenSearch?: () => void;
  title?: string;
}

export function Sidebar({ isOpen = true, onClose, onOpenUpload, onOpenSearch }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);

  const [mounted, setMounted] = useState(isAppHydrated);
  const [enableTransitions, setEnableTransitions] = useState(isAppHydrated);

  useEffect(() => {
    isAppHydrated = true;
    setMounted(true);
    const timer = setTimeout(() => {
      setEnableTransitions(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const isConversationMode =
    pathname === "/conversation" ||
    pathname.startsWith("/conversation/") ||
    pathname === "/chat" ||
    pathname.startsWith("/chat/");

  if (isConversationMode) {
    return (
      <Suspense fallback={null}>
        <ConversationSidebarWithDoc isOpen={isOpen} onClose={onClose} />
      </Suspense>
    );
  }

  const isCollapsed = mounted ? isSidebarCollapsed : false;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container matching Image 1: Deep obsidian surface with refined borders */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-white/[0.05] bg-[#07080c] select-none lg:static lg:h-full lg:translate-x-0 shrink-0 overflow-hidden transition-colors duration-150",
          enableTransitions && "transition-[width] duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-72",
        )}
      >
        {/* Ambient subtle light gradient inside sidebar */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-20 -left-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Brand Header with Stylized D Logo */}
        <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={setSidebarCollapsed} />

        {/* Navigation Menu & Upgrade to Pro Card */}
        <SidebarNavigation
          isCollapsed={isCollapsed}
          onClose={onClose}
          onOpenSearch={onOpenSearch}
        />
      </aside>
    </>
  );
}
