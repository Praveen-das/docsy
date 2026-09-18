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

function ConversationSidebarWithDoc({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
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

export function Sidebar({ isOpen, onClose, onOpenUpload, onOpenSearch }: SidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);

  const effectiveIsOpen = isOpen ?? isMobileSidebarOpen;
  const effectiveOnClose = onClose ?? (() => setMobileSidebarOpen(false));

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
        <ConversationSidebarWithDoc isOpen={effectiveIsOpen} onClose={effectiveOnClose} />
      </Suspense>
    );
  }

  const isCollapsed = mounted ? isSidebarCollapsed : false;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {effectiveIsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs will-change-transform lg:hidden transition-opacity"
          onClick={effectiveOnClose}
        />
      )}

      {/* Sidebar Container matching Image 1: Deep obsidian surface without right border */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#07080c] select-none lg:static lg:h-full lg:translate-x-0 shrink-0 overflow-hidden transition-colors duration-150",
          enableTransitions && "transition-[width] duration-200 ease-out",
          effectiveIsOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Ambient subtle light gradient inside sidebar matching reference image */}
        <div className="absolute top-4 -left-10 w-44 h-44 bg-blue-600/8 rounded-full blur-3xl will-change-transform pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-0 w-44 h-80 bg-indigo-300/5 rounded-full blur-3xl will-change-transform pointer-events-none -z-10" />

        {/* Brand Header with Stylized D Logo */}
        <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={setSidebarCollapsed} />

        {/* Navigation Menu & Upgrade to Pro Card */}
        <SidebarNavigation isCollapsed={isCollapsed} onClose={effectiveOnClose} onOpenSearch={onOpenSearch} />
      </aside>
    </>
  );
}
