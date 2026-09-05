"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PdfViewer } from "@/features/pdf-viewer/pdf-viewer";
import { ChatView } from "@/features/chat/chat-view";
import { Citation } from "@/types";
import { ConversationLayout } from "@/features/conversations/components/conversation-layout";
import { useDocumentStore } from "@/stores/document-store";
import { useConversationStore } from "@/stores/conversation-store";

export default function ConversationWorkspacePage() {
  const activeConversationId = useConversationStore(
    (state) => state.activeConversationId
  );
  const activeDocumentId = useConversationStore(
    (state) => state.activeDocumentId
  );
  const setActiveDocument = useConversationStore(
    (state) => state.setActiveDocument
  );
  const markDocumentAsOpened = useDocumentStore(
    (state) => state.markDocumentAsOpened
  );

  // Local UI state for cross-pane citation spotlight & mobile tabs
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [mobileTab, setMobileTab] = useState<"pdf" | "conversation">(
    "conversation"
  );

  // Synchronize on initial mount from query parameters once
  useEffect(() => {
    useDocumentStore.getState().fetchDocuments();
    useConversationStore
      .getState()
      .fetchConversations()
      .then(() => {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        const docParam = params.get("doc");
        const convParam = params.get("conv");

        const state = useConversationStore.getState();
        const docState = useDocumentStore.getState();
        const firstDoc = docState.documents[0];
        const targetDocId =
          docParam || state.activeDocumentId || firstDoc?.id || "";

        if (targetDocId) {
          state.setActiveDocument(targetDocId);
          markDocumentAsOpened(targetDocId);

          const docConvs = state.conversations
            .filter((c) => c.documentIds.includes(targetDocId))
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );

          if (convParam) {
            const found = state.conversations.find((c) => c.id === convParam);
            if (found) {
              state.setActiveConversation(convParam);
              return;
            }
          }

          if (
            !state.activeConversationId ||
            !docConvs.some((c) => c.id === state.activeConversationId)
          ) {
            if (docConvs.length > 0) {
              state.setActiveConversation(docConvs[0].id);
            } else {
              const newId = state.createConversation(targetDocId);
              state.setActiveConversation(newId);
            }
          }
        }
      });
  }, [markDocumentAsOpened]);

  const docId = activeDocumentId || "doc-1";

  // URL shallow sync when active conversation changes
  useEffect(() => {
    if (typeof window === "undefined" || !activeConversationId) return;
    const currentUrl = new URL(window.location.href);
    if (
      currentUrl.searchParams.get("doc") !== docId ||
      currentUrl.searchParams.get("conv") !== activeConversationId
    ) {
      currentUrl.searchParams.set("doc", docId);
      currentUrl.searchParams.set("conv", activeConversationId);
      window.history.replaceState({}, "", currentUrl.toString());
    }
  }, [activeConversationId, docId]);

  const handleSelectCitation = useCallback(
    (citation: Citation) => {
      setActiveDocument(citation.documentId);
      setActiveCitation(citation);
      if (window.innerWidth < 1024) {
        setMobileTab("pdf");
      }
    },
    [setActiveDocument]
  );

  return (
    <AppLayout title="Conversation">
      <ConversationLayout
        mobileTab={mobileTab}
        onMobileTabChange={setMobileTab}
        pdfViewer={<PdfViewer targetCitation={activeCitation} />}
        chatPanel={
          <ChatView
            activeCitation={activeCitation}
            onSelectCitation={handleSelectCitation}
          />
        }
      />
    </AppLayout>
  );
}
