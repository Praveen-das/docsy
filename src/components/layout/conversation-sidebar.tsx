"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { SidebarHeader } from "./sidebar-header";
import { NewConversationButton } from "@/features/conversations/components/new-conversation-button";
import { ActiveDocumentBanner } from "@/features/conversations/components/active-document-banner";
import { ConversationList } from "@/features/conversations/components/conversation-list";
import { ModalBackdrop } from "@/components/ui/modal-backdrop";
import { useSidebarState } from "./use-sidebar-state";

export interface ConversationSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  documentId?: string | null;
  onToggleViewer?: () => void;
}

export function ConversationSidebar({
  isOpen,
  onClose,
  documentId,
}: ConversationSidebarProps = {}) {
  const router = useRouter();
  const {
    setSidebarCollapsed,
    effectiveIsOpen,
    effectiveOnClose,
    isCollapsed,
    enableTransitions,
  } = useSidebarState(isOpen, onClose);

  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);

  // Current document info
  const { data: documents = [], isLoading: isLoadingDocs } = useDocuments();
  const activeDocument = documentId ? documents.find((d) => d.id === documentId) : undefined;
  const documentName = activeDocument?.originalName || "System Design Notes.pdf";

  const handleCreateNewConversation = () => {
    setActiveConversation(null);
    router.push(documentId ? `/conversation?doc=${documentId}` : "/conversation");
    effectiveOnClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {effectiveIsOpen && (
        <ModalBackdrop className="z-40 lg:hidden" onClose={effectiveOnClose} />
      )}

      {/* Sidebar Container */}
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
        {/* Brand Header */}
        <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={setSidebarCollapsed} />

        {/* Primary Action Button: + New Conversation */}
        <NewConversationButton isCollapsed={isCollapsed} onClick={handleCreateNewConversation} />

        {/* Scrollable Center Section: CURRENT DOCUMENT & CONVERSATIONS */}
        <div className="flex-1 overflow-y-auto space-y-4 mt-2 pb-4">
          <ActiveDocumentBanner
            document={activeDocument}
            documentName={documentName}
            isCollapsed={isCollapsed}
            isLoading={Boolean(documentId && isLoadingDocs && !activeDocument)}
          />
          <ConversationList documentId={documentId} isCollapsed={isCollapsed} onClose={onClose} />
        </div>
      </aside>
    </>
  );
}
