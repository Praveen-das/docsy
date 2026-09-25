"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocumentStore } from "@/stores/document-store";
import { useUIStore } from "@/stores/ui-store";
import { SidebarHeader } from "./sidebar-header";
import { NewConversationButton } from "@/features/conversations/components/new-conversation-button";
import { ActiveDocumentBanner } from "@/features/conversations/components/active-document-banner";
import { ConversationList } from "@/features/conversations/components/conversation-list";
import { ModalBackdrop } from "@/components/ui/modal-backdrop";
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

export function ConversationSidebar({ isOpen, onClose, documentId, onToggleViewer }: ConversationSidebarProps = {}) {
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

  const isCollapsed = mounted ? isSidebarCollapsed : false;

  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);

  // Current document info
  const documents = useDocumentStore((state) => state.documents);
  const activeDocument = documentId ? documents.find((d) => d.id === documentId) : undefined;
  const documentName =
    activeDocument?.originalName || (documentId ? "System Design Notes.pdf" : "System Design Notes.pdf");

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
        <ModalBackdrop className="z-40 lg:hidden" onClose={effectiveOnClose} />
      )}

      {/* Sidebar Container matching Image 2 */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#08090d] select-none lg:static lg:h-full lg:translate-x-0 shrink-0 overflow-hidden transition-colors duration-150",
          enableTransitions && "transition-[width] duration-200 ease-out",
          effectiveIsOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className="absolute top-4 -left-10 w-44 h-44 bg-blue-600/8 rounded-full blur-3xl will-change-transform pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-0 w-44 h-80 bg-indigo-300/5 rounded-full blur-3xl will-change-transform pointer-events-none -z-10" />
        {/* Brand Header with Stylized D Logo */}
        <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={setSidebarCollapsed} />

        {/* Primary Action Button: + New Conversation matching Image 2 */}
        <NewConversationButton isCollapsed={isCollapsed} onClick={handleCreateNewConversation} />

        {/* Scrollable Center Section: CURRENT DOCUMENT & CONVERSATIONS */}
        <div className="flex-1 overflow-y-auto pace-y-4 mt-2 pb-4">
          <ActiveDocumentBanner document={activeDocument} documentName={documentName} isCollapsed={isCollapsed} />
          <ConversationList documentId={documentId} isCollapsed={isCollapsed} onClose={onClose} />
        </div>
      </aside>
    </>
  );
}
