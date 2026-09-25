"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatView } from "@/features/chat/chat-view";
import { PdfViewer } from "@/features/pdf-viewer/pdf-viewer";
import { Document } from "@/types";
import { ConversationLayout } from "@/features/conversations/components/conversation-layout";
import { SelectDocumentModal } from "@/features/documents/components/select-document-modal";
import { useUIStore } from "@/stores/ui-store";
import { useDocumentStore } from "@/stores/document-store";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { useConversationStore } from "@/stores/conversation-store";
import { useConversations } from "@/features/conversations/hooks/use-conversations";
import { FileText, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function ConversationWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("doc");
  const convId = searchParams.get("conv");

  const { data: documents = [] } = useDocuments();
  const { conversations } = useConversations();
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);
  const markDocumentAsOpened = useDocumentStore((state) => state.markDocumentAsOpened);

  const [isViewerOpen, setIsViewerOpen] = useState(true);
  const [selectDocOpen, setSelectDocOpen] = useState(false);
  const openUpload = useUIStore((state) => state.openUpload);

  // Effective doc ID: if none in search params, use first document if exists
  const effectiveDocId = docId || (documents.length > 0 ? documents[0].id : null);

  // Sync conversation selection with URL search parameters
  useEffect(() => {
    if (!effectiveDocId) {
      if (useConversationStore.getState().activeConversationId !== null) {
        setActiveConversation(null);
      }
      return;
    }

    markDocumentAsOpened(effectiveDocId);

    const currentActive = useConversationStore.getState().activeConversationId;

    if (convId) {
      const found = conversations.find((c) => c.id === convId);
      if (found) {
        if (currentActive !== convId) {
          setActiveConversation(convId);
        }
        return;
      }
    }

    // When no conv param is in the URL, do not auto-activate any conversation
    if (currentActive !== null) {
      setActiveConversation(null);
    }
  }, [effectiveDocId, convId, conversations, markDocumentAsOpened, setActiveConversation]);

  const handleDocumentSelected = (doc: Document) => {
    setSelectDocOpen(false);
    router.push(`/conversation?doc=${doc.id}`);
  };

  return (
    <>
      {effectiveDocId ? (
        <ConversationLayout
          chatPanel={
            <ChatView
              documentId={effectiveDocId}
              isViewerOpen={isViewerOpen}
              onToggleViewer={() => setIsViewerOpen((prev) => !prev)}
            />
          }
          // pdfViewer={
          //   <PdfViewer
          //     activeDocumentId={effectiveDocId}
          //     onClose={() => setIsViewerOpen(false)}
          //   />
          // }
          isViewerOpen={isViewerOpen}
          onToggleViewer={() => setIsViewerOpen((prev) => !prev)}
        />
      ) : (
        /* Bare /conversation Empty Selection State */
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-[#08090d]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-indigo-400 border border-white/10 mb-4 shadow-inner">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Select a Document to Start</h2>
          <p className="mt-2 max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Choose a document from your library to view its PDF pages and start an AI-grounded conversation.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="gradient"
              onClick={() => setSelectDocOpen(true)}
              className="gap-2 h-10 px-5 text-xs font-semibold"
            >
              <FileText className="h-4 w-4" />
              <span>Select Document</span>
            </Button>
            <Button onClick={openUpload} variant="outline" className="gap-2 h-10 px-5 text-xs font-medium">
              <UploadCloud className="h-4 w-4" />
              <span>Upload New PDF</span>
            </Button>
          </div>
        </div>
      )}

      {/* Document Selector Modal for bare visits or document switching */}
      <SelectDocumentModal
        isOpen={selectDocOpen}
        onClose={() => setSelectDocOpen(false)}
        onSelectDocument={handleDocumentSelected}
        onOpenUpload={openUpload}
      />
    </>
  );
}

export default function ConversationWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-[#08090d]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      }
    >
      <ConversationWorkspace />
    </Suspense>
  );
}
