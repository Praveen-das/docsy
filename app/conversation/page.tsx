"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { PdfViewer } from "@/features/pdf-viewer/pdf-viewer";
import { ChatView } from "@/features/chat/chat-view";
import { Document } from "@/types";
import { ConversationLayout } from "@/features/conversations/components/conversation-layout";
import { SelectDocumentModal } from "@/features/documents/components/select-document-modal";
import { UploadModal } from "@/features/documents/upload-modal";
import { useDocumentStore } from "@/stores/document-store";
import { useConversationStore } from "@/stores/conversation-store";
import { FileText, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function ConversationWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("doc");
  const convId = searchParams.get("conv");

  const conversations = useConversationStore((state) => state.conversations);
  const setActiveConversation = useConversationStore(
    (state) => state.setActiveConversation
  );
  const markDocumentAsOpened = useDocumentStore(
    (state) => state.markDocumentAsOpened
  );

  // Local UI state for mobile tabs
  const [mobileTab, setMobileTab] = useState<"pdf" | "conversation">("conversation");

  // Modal states for bare /conversation handling
  const [selectDocOpen, setSelectDocOpen] = useState(!docId);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Automatically trigger document selector if visiting /conversation without docId
  useEffect(() => {
    if (!docId) {
      setSelectDocOpen(true);
    }
  }, [docId]);

  // Initial fetch of documents & conversations
  useEffect(() => {
    useDocumentStore.getState().fetchDocuments();
    useConversationStore.getState().fetchConversations();
  }, []);

  // Sync conversation selection with URL search parameters
  useEffect(() => {
    if (!docId) {
      if (useConversationStore.getState().activeConversationId !== null) {
        setActiveConversation(null);
      }
      return;
    }

    markDocumentAsOpened(docId);

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
  }, [docId, convId, conversations, markDocumentAsOpened, setActiveConversation]);

  const handleDocumentSelected = (doc: Document) => {
    setSelectDocOpen(false);
    router.push(`/conversation?doc=${doc.id}`);
  };

  return (
    <AppLayout title="Conversation">
      {docId ? (
        <ConversationLayout
          mobileTab={mobileTab}
          onMobileTabChange={setMobileTab}
          pdfViewer={<PdfViewer activeDocumentId={docId} />}
          chatPanel={<ChatView documentId={docId} />}
        />
      ) : (
        /* Bare /conversation Empty Selection State */
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner dark:bg-blue-600/10 dark:text-blue-400 mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            Select a Document to Start
          </h2>
          <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Choose a document from your library to view its PDF pages and start an AI-grounded conversation.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => setSelectDocOpen(true)}
              className="gap-2 px-5 py-2.5 font-medium shadow-sm"
            >
              <FileText className="h-4 w-4" />
              <span>Select Document</span>
            </Button>
            <Button
              onClick={() => setUploadModalOpen(true)}
              variant="outline"
              className="gap-2 px-5 py-2.5 border-zinc-200 hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5"
            >
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
        onOpenUpload={() => setUploadModalOpen(true)}
      />

      {/* Upload Modal fallback */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={() => {
          useDocumentStore.getState().fetchDocuments();
        }}
      />
    </AppLayout>
  );
}

export default function ConversationWorkspacePage() {
  return (
    <Suspense
      fallback={
        <AppLayout title="Conversation">
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        </AppLayout>
      }
    >
      <ConversationWorkspace />
    </Suspense>
  );
}
