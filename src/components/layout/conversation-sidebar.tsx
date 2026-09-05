"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocumentStore } from "@/stores/document-store";
import { useUIStore } from "@/stores/ui-store";
import { UserMenu } from "./user-menu";
import { ConversationSidebarHeader } from "@/features/conversations/components/conversation-sidebar-header";
import { NewConversationButton } from "@/features/conversations/components/new-conversation-button";
import { ActiveDocumentBanner } from "@/features/conversations/components/active-document-banner";
import { ConversationList } from "@/features/conversations/components/conversation-list";

// Module-scoped hydration flag: persists across client-side Next.js route transitions
let isAppHydrated = false;

export interface ConversationSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  documentId: string;
}

export function ConversationSidebar({
  isOpen = true,
  onClose,
  documentId,
}: ConversationSidebarProps) {
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

  const isCollapsed = mounted ? isSidebarCollapsed : false;

  const createConversation = useConversationStore(
    (state) => state.createConversation
  );

  // Current document info
  const documents = useDocumentStore((state) => state.documents);
  const activeDocument = documents.find((d) => d.id === documentId);
  const documentName = activeDocument?.originalName || "Document";

  const handleCreateNewConversation = () => {
    const newConvId = createConversation(documentId);
    router.push(`/conversation?doc=${documentId}&conv=${newConvId}`);
    onClose?.();
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
          isCollapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Header with Brand Link & Return to Documents */}
        <ConversationSidebarHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={setSidebarCollapsed}
          onClose={onClose}
        />

        {/* Primary Action Button: + New Conversation */}
        <NewConversationButton
          isCollapsed={isCollapsed}
          onClick={handleCreateNewConversation}
        />

        {/* Navigation / Conversations List Area */}
        <div className="flex-1 overflow-y-auto px-3.5 pt-2 pb-3 space-y-3.5">
          <ActiveDocumentBanner
            documentName={documentName}
            isCollapsed={isCollapsed}
          />

          <ConversationList
            documentId={documentId}
            isCollapsed={isCollapsed}
            onClose={onClose}
          />
        </div>

        {/* Shared User Profile Footer */}
        <UserMenu isCollapsed={isCollapsed} onClose={onClose} />
      </aside>
    </>
  );
}
