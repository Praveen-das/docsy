"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocumentStore } from "@/stores/document-store";
import { useSubscription } from "@/features/billing/use-subscription";
import { PLANS } from "@/lib/stripe-plans";
import { StorageMeter } from "./billing/storage-meter";
import { DocumentsMeter } from "./billing/documents-meter";
import { PurgeDialog } from "./data-controls/purge-dialog";
import { ClearCacheDialog } from "./data-controls/clear-cache-dialog";

const STORAGE_LIMIT_FREE_BYTES = 50 * 1024 * 1024; // 50 MB
const STORAGE_LIMIT_PRO_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

type DataControlsDialog = "conversations" | "documents" | "cache" | null;

export function TabDataControls() {
  const conversations = useConversationStore((state) => state.conversations);
  const deleteConversation = useConversationStore((state) => state.deleteConversation);

  const documents = useDocumentStore((state) => state.documents);
  const deleteDocument = useDocumentStore((state) => state.deleteDocument);

  const { data: subscription } = useSubscription();
  const isPro = subscription?.plan === "pro";
  const planDef = isPro ? PLANS.pro : PLANS.free;

  const totalBytesUsed = useMemo(
    () => documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0),
    [documents]
  );
  const storageLimitBytes = isPro ? STORAGE_LIMIT_PRO_BYTES : STORAGE_LIMIT_FREE_BYTES;

  const [activeDialog, setActiveDialog] = useState<DataControlsDialog>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const showFeedback = useCallback((msg: string) => {
    setFeedbackNotice(msg);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackNotice(null);
    }, 3500);
  }, []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
  }, []);

  // Delete all conversations
  const handleDeleteAllConversations = async () => {
    try {
      const convIds = conversations.map((c) => c.id);
      await Promise.allSettled(convIds.map((id) => deleteConversation(id)));
      closeDialog();
      showFeedback(`Successfully deleted ${convIds.length} conversation${convIds.length === 1 ? "" : "s"}.`);
    } catch (err) {
      console.error("Failed to delete conversations:", err);
      showFeedback("Failed to delete some conversations. Please try again.");
    }
  };

  // Delete all documents
  const handleDeleteAllDocuments = async () => {
    try {
      const docIds = documents.map((d) => d.id);
      await Promise.allSettled(docIds.map((id) => deleteDocument(id)));
      closeDialog();
      showFeedback(`Successfully deleted ${docIds.length} document${docIds.length === 1 ? "" : "s"}.`);
    } catch (err) {
      console.error("Failed to delete documents:", err);
      showFeedback("Failed to delete some documents. Please try again.");
    }
  };

  // Clear local cache & reload
  const handleClearCache = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to clear storage:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header text */}
      <div>
        <h4 className="text-[13.5px] font-medium text-zinc-200">Data & Storage Management</h4>
        <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">
          Manage your saved workspace data, document indexes, conversation history, and local cache.
        </p>
      </div>

      {/* Feedback banner */}
      {feedbackNotice && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-xs text-indigo-300 animate-in fade-in">
          {feedbackNotice}
        </div>
      )}

      {/* Storage Usage & Quota Allocation */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 space-y-4">
        <StorageMeter totalBytesUsed={totalBytesUsed} storageLimitBytes={storageLimitBytes} />
        <div className="pt-3 border-t border-white/[0.05]">
          <DocumentsMeter documentsCount={documents.length} documentsLimit={planDef.maxDocuments} />
        </div>
      </div>

      {/* Action items list */}
      <div className="divide-y divide-white/[0.06]">
        {/* 1. Delete All Conversations */}
        <div className="flex items-center justify-between py-3.5 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[13.5px] font-medium text-zinc-200 block">Delete All Conversations</span>
              <span className="text-[12px] text-zinc-500">
                Permanently purge {conversations.length} conversation{conversations.length === 1 ? "" : "s"} and their chat histories
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={conversations.length === 0}
            onClick={() => setActiveDialog("conversations")}
            className="rounded-full bg-rose-500/[0.08] hover:bg-rose-500/[0.16] disabled:opacity-40 disabled:pointer-events-none text-rose-400 border border-rose-500/20 px-3.5 py-1.5 text-xs font-medium transition-colors active:scale-[0.98] cursor-pointer shrink-0"
          >
            Delete All
          </button>
        </div>

        {/* 2. Delete All Documents */}
        <div className="flex items-center justify-between py-3.5 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[13.5px] font-medium text-zinc-200 block">Delete All Documents</span>
              <span className="text-[12px] text-zinc-500">
                Purge {documents.length} document{documents.length === 1 ? "" : "s"} and their vector embeddings
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={documents.length === 0}
            onClick={() => setActiveDialog("documents")}
            className="rounded-full bg-rose-500/[0.08] hover:bg-rose-500/[0.16] disabled:opacity-40 disabled:pointer-events-none text-rose-400 border border-rose-500/20 px-3.5 py-1.5 text-xs font-medium transition-colors active:scale-[0.98] cursor-pointer shrink-0"
          >
            Delete All
          </button>
        </div>

        {/* 3. Clear Cache */}
        <div className="flex items-center justify-between py-3.5 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[13.5px] font-medium text-zinc-200 block">Clear Application Cache</span>
              <span className="text-[12px] text-zinc-500">
                Remove locally stored view states, draft messages, and cached configurations
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveDialog("cache")}
            className="rounded-full bg-white/[0.06] hover:bg-white/[0.10] text-zinc-300 border border-white/[0.10] px-3.5 py-1.5 text-xs font-medium transition-colors active:scale-[0.98] cursor-pointer shrink-0"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Confirmation Dialog: Conversations */}
      <PurgeDialog
        isOpen={activeDialog === "conversations"}
        onClose={closeDialog}
        onConfirm={handleDeleteAllConversations}
        title="Delete All Conversations?"
        description="This will permanently delete every conversation and chat history from your account. Documents will NOT be deleted."
        warningText={`This action cannot be undone. All ${conversations.length} conversation(s) will be permanently lost.`}
        confirmButtonText="Delete All Conversations"
      />

      {/* Confirmation Dialog: Documents */}
      <PurgeDialog
        isOpen={activeDialog === "documents"}
        onClose={closeDialog}
        onConfirm={handleDeleteAllDocuments}
        title="Delete All Documents?"
        description="This will permanently delete all uploaded documents, processed text, and embeddings. Any conversations referencing them will also be affected."
        warningText={`This action cannot be undone. All ${documents.length} document(s) will be permanently purged from storage.`}
        confirmButtonText="Delete All Documents"
      />

      {/* Confirmation Dialog: Clear Cache */}
      <ClearCacheDialog
        isOpen={activeDialog === "cache"}
        onClose={closeDialog}
        onConfirm={handleClearCache}
      />
    </div>
  );
}
