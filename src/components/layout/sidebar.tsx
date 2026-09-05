"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useConversationStore } from "@/stores/conversation-store";
import { Upload } from "lucide-react";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNavigation } from "./sidebar-navigation";
import { UserMenu } from "./user-menu";
import { ConversationSidebar } from "./conversation-sidebar";

// Module-scoped hydration flag: persists across client-side Next.js route transitions
let isAppHydrated = false;

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenUpload?: () => void;
  title?: string;
}

export function Sidebar({ isOpen = true, onClose, onOpenUpload }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const activeDocumentId = useConversationStore((state) => state.activeDocumentId);

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

  const isConversationMode = pathname.startsWith("/conversation") || pathname.startsWith("/chat");

  if (isConversationMode) {
    return <ConversationSidebar isOpen={isOpen} onClose={onClose} documentId={activeDocumentId || "doc-1"} />;
  }

  const isCollapsed = mounted ? isSidebarCollapsed : false;

  const handleUploadClick = () => {
    onClose?.();
    if (onOpenUpload) {
      onOpenUpload();
    } else {
      router.push("/conversation");
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity dark:bg-black/60"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-zinc-200 bg-[#fafafa] select-none lg:static lg:h-full lg:translate-x-0 shrink-0 overflow-hidden dark:border-white/5 dark:bg-[#0e0e12] transition-colors duration-150",
          enableTransitions && "transition-[width] duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-[68px]" : "w-64",
        )}
      >
        {/* Brand Header */}
        <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={setSidebarCollapsed} />

        {/* Primary Action Button: Upload PDF */}
        <div className="px-3.5 mt-3.5 pb-1">
          <Button
            variant="primary"
            size="md"
            onClick={handleUploadClick}
            title="Upload PDF"
            className={cn(
              "w-full h-10 p-0 flex items-center overflow-hidden tracking-[-0.01em]",
              "rounded-[10px] shadow-sm",
              "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950",
              "dark:bg-[#1d1d24] dark:text-white dark:hover:bg-[#27272f] dark:active:bg-[#18181e]",
              "dark:ring-1 dark:ring-white/[0.08]",
            )}
          >
            <div className="h-10 flex items-center justify-center shrink-0">
              <Upload className="h-4 w-4 shrink-0" />
            </div>

            {!isCollapsed && (
              <span className="pr-3.5 font-medium text-[13px] tracking-[-0.01em] truncate">Upload PDF</span>
            )}
          </Button>
        </div>

        {/* Navigation Menu */}
        <SidebarNavigation isCollapsed={isCollapsed} onClose={onClose} />

        {/* User Profile Footer */}
        <UserMenu isCollapsed={isCollapsed} onClose={onClose} />
      </aside>
    </>
  );
}
