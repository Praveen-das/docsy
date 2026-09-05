"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { UploadModal } from "@/features/documents/upload-modal";
import { Document, ProcessingStatus } from "@/types";
import {
  FileText,
  Search,
  Upload,
  Trash2,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Layers,
  Database,
  Calendar,
  Grid,
  List,
  Loader2,
} from "lucide-react";
import { useDocumentStore } from "@/stores/document-store";
import { useConversationStore } from "@/stores/conversation-store";
import { DocumentConversationsDialog } from "@/features/conversations/document-conversations-dialog";
import { formatDate } from "@/lib/format-time";

export default function DocumentsPage() {
  const documents = useDocumentStore((state) => state.documents);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);
  const deleteDocument = useDocumentStore((state) => state.deleteDocument);
  const reprocessDocument = useDocumentStore((state) => state.reprocessDocument);
  const openedDocumentIds = useDocumentStore((state) => state.openedDocumentIds);
  const markDocumentAsOpened = useDocumentStore((state) => state.markDocumentAsOpened);

  const conversations = useConversationStore((state) => state.conversations);
  const fetchConversations = useConversationStore((state) => state.fetchConversations);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [conversationsDoc, setConversationsDoc] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchConversations();
  }, [fetchDocuments, fetchConversations]);

  // Filter documents
  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.originalName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === "ready") return doc.status === "READY";
    if (statusFilter === "processing")
      return [
        "UPLOADING",
        "EXTRACTING",
        "CHUNKING",
        "EMBEDDING",
        "INDEXING",
      ].includes(doc.status);
    if (statusFilter === "failed") return doc.status === "FAILED";
    return true;
  });

  const handleDelete = async () => {
    if (!docToDelete) return;
    await deleteDocument(docToDelete.id);
    setDocToDelete(null);
  };

  const handleReprocess = async (docId: string) => {
    await reprocessDocument(docId);
  };

  return (
    <AppLayout title="My Documents">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              My Documents
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              View and manage your uploaded PDF files or start a conversation.
            </p>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
          >
            <Upload className="h-4 w-4" />
            <span>Upload New PDF</span>
          </Button>
        </div>

        {/* Search, Filters, and View Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-white/5">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by filename..."
                className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pl-9 pr-4 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-[#141418] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500/60"
              />
            </div>

            {/* Filter Tabs */}
            <Tabs
              activeId={statusFilter}
              onChange={setStatusFilter}
              className="shrink-0"
              options={[
                { id: "all", label: "All" },
                { id: "ready", label: "Ready" },
                { id: "processing", label: "Processing" },
                { id: "failed", label: "Failed" },
              ]}
            />
          </div>

          {/* List vs Grid view switcher */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 border border-zinc-200 self-end sm:self-auto dark:bg-[#141418] dark:border-white/10">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded p-1.5 transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-zinc-900 shadow-xs border-none dark:bg-[#24242d] dark:text-white dark:border-none"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded p-1.5 transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-zinc-900 shadow-xs border-none dark:bg-[#24242d] dark:text-white dark:border-none"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Document Content View */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-[#141418]">
            <FileText className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-500 mb-2" />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              No matching documents found
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Try adjusting your search query or status filter.
            </p>
          </div>
        ) : viewMode === "list" ? (
          /* List View: Consistent with Recent Documents on Dashboard */
          <div className="space-y-3">
            {filtered.map((doc) => {
              const isOpened = openedDocumentIds.includes(doc.id) || !!doc.hasOpened;

              return (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:px-5 sm:py-3.5 shadow-2xs hover:border-zinc-300 hover:bg-zinc-50/50 transition-all dark:border-white/10 dark:bg-[#141418] dark:hover:border-white/20 dark:hover:bg-[#18181f]"
                >
                  {/* Left: Document Information */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-[#1c1c22] dark:text-zinc-300 dark:border-white/5">
                      <FileText className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-white text-sm truncate">
                          {doc.originalName}
                        </span>

                        {/* Processing state: keep the first tag */}
                        {doc.status !== "READY" && doc.status !== "FAILED" && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium select-none">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Analyzing...</span>
                          </span>
                        )}

                        {/* Ready tag: displayed only if the user has not yet opened the document */}
                        {doc.status === "READY" && !isOpened && <StatusBadge status="READY" />}

                        {/* Error state: no background, no border */}
                        {doc.status === "FAILED" && <StatusBadge status="FAILED" />}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{doc.pageCount} pages</span>
                        <span className="text-zinc-300 dark:text-zinc-600">•</span>
                        <span>{(doc.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                        <span className="text-zinc-300 dark:text-zinc-600">•</span>
                        <span>{doc.chunkCount} sections</span>
                        <span className="text-zinc-300 dark:text-zinc-600">•</span>
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>

                      {/* Failure explanation if failed */}
                      {doc.error && (
                        <div className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                          <span>{doc.error}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {doc.status === "READY" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConversationsDoc(doc)}
                          className="h-8 px-2.5 text-xs gap-1.5"
                          title="View conversations for this document"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>
                            Conversations (
                            {conversations.filter((c) => c.documentIds.includes(doc.id)).length}
                            )
                          </span>
                        </Button>

                        <Link 
                          href={`/conversation?doc=${doc.id}`}
                          onClick={() => markDocumentAsOpened(doc.id)}
                        >
                          <Button size="sm" variant="accent" className="h-8 px-3 text-xs shadow-2xs">
                            <span>Open Chat</span>
                          </Button>
                        </Link>
                      </>
                    )}

                    {doc.status === "FAILED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReprocess(doc.id)}
                        className="h-8 px-3 text-xs"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Retry</span>
                      </Button>
                    )}

                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc) => {
              const isOpened = openedDocumentIds.includes(doc.id) || !!doc.hasOpened;

              return (
                <div
                  key={doc.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs hover:border-zinc-300 transition-all dark:border-white/10 dark:bg-[#141418] dark:hover:border-white/20 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-[#1c1c22] dark:text-zinc-300 dark:border-white/5">
                        <FileText className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                      </div>
                      {doc.status === "READY" && !isOpened && <StatusBadge status="READY" />}
                      {doc.status === "FAILED" && <StatusBadge status="FAILED" />}
                      {doc.status !== "READY" && doc.status !== "FAILED" && (
                        <StatusBadge status={doc.status} />
                      )}
                    </div>

                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-2">
                      {doc.originalName}
                    </h3>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-white/5 pt-2.5">
                      <div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block uppercase">
                          Size
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-300">
                          {(doc.fileSize / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block uppercase">
                          Pages
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-300">
                          {doc.pageCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block uppercase">
                          Sections
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-300">
                          {doc.chunkCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block uppercase">
                          Uploaded
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-300">
                          {formatDate(doc.createdAt)}
                        </span>
                      </div>
                    </div>

                    {doc.error && (
                      <p className="mt-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
                        {doc.error}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3">
                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded transition-colors cursor-pointer text-xs flex items-center gap-1 dark:text-zinc-500 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {doc.status === "FAILED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReprocess(doc.id)}
                          className="h-8 text-xs"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Retry</span>
                        </Button>
                      )}
                      {doc.status === "READY" && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConversationsDoc(doc)}
                            className="h-8 px-2 text-xs gap-1"
                            title="View conversations for this document"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span>
                              (
                              {conversations.filter((c) => c.documentIds.includes(doc.id)).length}
                              )
                            </span>
                          </Button>

                          <Link 
                            href={`/conversation?doc=${doc.id}`}
                            onClick={() => markDocumentAsOpened(doc.id)}
                          >
                            <Button size="sm" variant="accent" className="h-8 px-3 text-xs shadow-2xs">
                              <span>Open Chat</span>
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Document Confirmation Dialog */}
      <Dialog
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        title="Delete Document?"
        description="This will permanently remove this document and all its saved questions and answers from your account."
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Irreversible Action</p>
              <p className="mt-0.5">
                Deleting &ldquo;{docToDelete?.originalName}&rdquo; will decouple it
                from all active conversations.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDocToDelete(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          fetchDocuments();
        }}
      />
      {/* Document Conversations Modal */}
      <DocumentConversationsDialog
        isOpen={!!conversationsDoc}
        onClose={() => setConversationsDoc(null)}
        document={conversationsDoc}
      />
    </AppLayout>
  );
}
