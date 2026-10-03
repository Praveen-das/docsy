"use client";

import React, { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNavigation } from "./sidebar-navigation";
import { ConversationSidebar } from "./conversation-sidebar";
import { ModalBackdrop } from "@/components/ui/modal-backdrop";
import { useSidebarState } from "./use-sidebar-state";

function ConversationSidebarWithDoc({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("doc");
  return <ConversationSidebar isOpen={isOpen} onClose={onClose} documentId={documentId} />;
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  isPro?: boolean;
}

export function Sidebar({ isOpen, onClose, isPro }: SidebarProps = {}) {
  const pathname = usePathname();
  const {
    isSidebarCollapsed,
    setSidebarCollapsed,
    effectiveIsOpen,
    effectiveOnClose,
    isCollapsed,
    enableTransitions,
  } = useSidebarState(isOpen, onClose);

  const isConversationMode = pathname === "/conversation" || pathname.startsWith("/conversation/");

  if (isConversationMode) {
    return (
      <Suspense fallback={null}>
        <ConversationSidebarWithDoc isOpen={effectiveIsOpen} onClose={effectiveOnClose} />
      </Suspense>
    );
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {effectiveIsOpen && (
        <ModalBackdrop className="z-40 lg:hidden" onClose={effectiveOnClose} />
      )}

      {/* Sidebar Container matching Image 1: Deep obsidian surface without right border */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#07080c] select-none lg:static lg:h-full lg:translate-x-0 shrink-0 overflow-hidden shadow-2xl lg:shadow-none transition-transform lg:transition-[width] duration-200 ease-out",
          effectiveIsOpen ? "translate-x-0" : "-translate-x-full",
          "w-72 sm:w-64 max-w-[85vw] lg:max-w-none",
          isCollapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        {/* Ambient subtle light gradient inside sidebar matching reference image */}
        <div className="absolute top-4 -left-10 w-44 h-44 bg-blue-600/8 rounded-full blur-3xl will-change-transform pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-0 w-44 h-80 bg-indigo-300/5 rounded-full blur-3xl will-change-transform pointer-events-none -z-10" />

        {/* Brand Header with Stylized D Logo */}
        <SidebarHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={setSidebarCollapsed}
          onClose={effectiveOnClose}
        />

        {/* Navigation Menu & Upgrade to Pro Card */}
        <SidebarNavigation isCollapsed={isCollapsed} onClose={effectiveOnClose} isPro={isPro} />
      </aside>
    </>
  );
}

export function SidebarFallback() {
  return (
    <aside
      aria-hidden="true"
      className="hidden lg:flex flex-col bg-[#07080c] select-none lg:static lg:h-full shrink-0 overflow-hidden lg:w-64"
    >
      <div className="flex h-20 shrink-0 items-center px-5 gap-3.5">
        <div className="h-8 w-8 rounded-xl bg-white/[0.06] animate-pulse" />
        <div className="h-5 w-20 rounded-md bg-white/[0.06] animate-pulse" />
      </div>

      <div className="flex-1 flex flex-col pt-4 pb-5 gap-3 px-2">
        <div className="space-y-2">
          <div className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />
          <div className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />
          <div className="h-10 rounded-xl bg-white/[0.04] animate-pulse" />
        </div>

        <div className="flex-1 min-h-0 mx-2 pt-4 border-t border-white/[0.06] space-y-2.5">
          <div className="h-3 w-16 rounded bg-white/[0.05] animate-pulse" />
          <div className="space-y-2 pt-1">
            <div className="h-8 rounded-lg bg-white/[0.03] animate-pulse" />
            <div className="h-8 rounded-lg bg-white/[0.03] animate-pulse" />
            <div className="h-8 rounded-lg bg-white/[0.03] animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
}

