"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocumentStore } from "@/stores/document-store";
import { useUIStore } from "@/stores/ui-store";
import { UserMenu } from "./user-menu";
import { SidebarHeader } from "./sidebar-header";
import { NewConversationButton } from "@/features/conversations/components/new-conversation-button";
import { ActiveDocumentBanner } from "@/features/conversations/components/active-document-banner";
import { ConversationList } from "@/features/conversations/components/conversation-list";
import { Home, FileText, MessageSquare, Settings } from "lucide-react";

let isAppHydrated = false;

export interface ConversationSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  documentId?: string | null;
  onToggleViewer?: () => void;
}

const QUICK_NAV = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Conversations", href: "/conversations", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function ConversationSidebar({
  isOpen,
  onClose,
  documentId,
  onToggleViewer,
}: ConversationSidebarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
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

  const isCollapsed = mounted ? isSidebarCollapsed : false;

  const setActiveConversation = useConversationStore(
    (state) => state.setActiveConversation
  );

  // Current document info
  const documents = useDocumentStore((state) => state.documents);
  const activeDocument = documentId ? documents.find((d) => d.id === documentId) : undefined;
  const documentName = activeDocument?.originalName || (documentId ? "System Design Notes.pdf" : "System Design Notes.pdf");

  const handleCreateNewConversation = () => {
    setActiveConversation(null);
    if (documentId) {
      router.push(`/conversation?doc=${documentId}`);
    } else {
      router.push("/conversation");
    }
    effectiveOnClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {effectiveIsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={effectiveOnClose}
        />
      )}

      {/* Sidebar Container matching Image 2 */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#08090d] select-none lg:static lg:h-full lg:translate-x-0 shrink-0 overflow-hidden transition-colors duration-150",
          enableTransitions && "transition-[width] duration-200 ease-out",
          effectiveIsOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Brand Header with Stylized D Logo */}
        <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={setSidebarCollapsed} />

        {/* Primary Action Button: + New Conversation matching Image 2 */}
        <NewConversationButton
          isCollapsed={isCollapsed}
          onClick={handleCreateNewConversation}
        />

        {/* Quick Nav Links matching Image 2 */}
        <div className="px-3 py-1 space-y-0.5">
          {QUICK_NAV.map((nav) => {
            const Icon = nav.icon;
            const isMatch = pathname === nav.href;

            return (
              <Link
                key={nav.label}
                href={nav.href}
                onClick={effectiveOnClose}
                title={isCollapsed ? nav.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors",
                  isMatch
                    ? "bg-white/[0.06] text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
                {!isCollapsed && <span className="text-[12.5px]">{nav.label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="my-2 border-t border-white/[0.06] mx-3" />

        {/* Scrollable Center Section: CURRENT DOCUMENT & CONVERSATIONS */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4 pb-4">
          <ActiveDocumentBanner
            document={activeDocument}
            documentName={documentName}
            isCollapsed={isCollapsed}
            onOpenViewer={onToggleViewer}
          />

          <ConversationList
            documentId={documentId}
            isCollapsed={isCollapsed}
            onClose={onClose}
          />
        </div>

        {/* Shared User Profile & Theme Toggle Footer matching Image 2 */}
        <UserMenu isCollapsed={isCollapsed} onClose={onClose} />
      </aside>
    </>
  );
}
