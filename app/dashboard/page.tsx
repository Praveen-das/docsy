"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { UploadModal } from "@/features/documents/upload-modal";
import { Document, ProcessingStatus } from "@/types";
import { FileText, MessageSquare, UploadCloud, ArrowRight, Clock, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/stores/document-store";
import { useConversationStore } from "@/stores/conversation-store";
import { DocumentConversationsDialog } from "@/features/conversations/document-conversations-dialog";
import { formatRelativeTime, formatDate } from "@/lib/format-time";

export default function DashboardPage() {
  const { user } = useUser();
  const documents = useDocumentStore((state) => state.documents);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);
  const reprocessDocument = useDocumentStore((state) => state.reprocessDocument);
  const openedDocumentIds = useDocumentStore((state) => state.openedDocumentIds);
  const markDocumentAsOpened = useDocumentStore((state) => state.markDocumentAsOpened);

  const conversations = useConversationStore((state) => state.conversations);
  const fetchConversations = useConversationStore((state) => state.fetchConversations);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [conversationsDoc, setConversationsDoc] = useState<Document | null>(null);

  const [quota, setQuota] = useState<{
    dailyQueriesUsed: number;
    dailyQueriesLimit: number;
  }>({
    dailyQueriesUsed: 0,
    dailyQueriesLimit: 50,
  });

  useEffect(() => {
    fetchDocuments();
    fetchConversations();
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setQuota({
            dailyQueriesUsed: data.dailyQueriesUsed ?? 0,
            dailyQueriesLimit: data.dailyQueriesLimit ?? 50,
          });
        }
      })
      .catch(() => {});
  }, [fetchDocuments, fetchConversations]);

  const handleReprocess = async (docId: string) => {
    await reprocessDocument(docId);
  };

  return (
    <AppLayout title="Dashboard">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-7">
        {/* Welcome Header & Unobtrusive Daily Query Quota */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-white/5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Welcome back, {user?.firstName || "there"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Upload PDF documents to ask questions, review summaries, and verify answers with page citations.
            </p>
          </div>

          {/* Unobtrusive Daily Query Quota Indicator */}
          <div className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 shadow-2xs self-start md:self-auto w-full sm:w-64 md:w-72 dark:border-white/10 dark:bg-[#141418]">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">Daily Queries</span>
              <span className="font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {Math.max(
                  0,
                  100 -
                    Math.round(
                      (quota.dailyQueriesUsed / (quota.dailyQueriesLimit || 1)) * 100
                    )
                )}% remaining
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-[#0071e3] rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (quota.dailyQueriesUsed / (quota.dailyQueriesLimit || 1)) * 100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Upload Dropzone Banner */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            setIsUploadOpen(true);
          }}
          onClick={() => setIsUploadOpen(true)}
          className={cn(
            "flex flex-col sm:flex-row items-center justify-between rounded-[14px] p-4 sm:p-5 transition-all duration-150 ease-out cursor-pointer group select-none active:scale-[0.99]",
            isDragging
              ? "border-2 border-dashed border-zinc-900 bg-zinc-100/80 shadow-sm dark:border-white/30 dark:bg-white/5"
              : "border border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/80 shadow-2xs dark:border-white/10 dark:bg-[#141418] dark:hover:border-white/20 dark:hover:bg-[#18181f] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
          )}
        >
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Icon Tile matching upload-modal styling */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-2xs group-hover:bg-zinc-200/70 group-hover:border-zinc-300 dark:bg-[#1c1c22] dark:text-white dark:border-white/10 dark:group-hover:border-white/20 dark:group-hover:bg-[#23232b] transition-all duration-150 ease-out">
              <UploadCloud className="h-5 w-5 stroke-[2.2] transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:scale-105" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-[-0.01em] group-hover:text-zinc-800 dark:group-hover:text-zinc-100 transition-colors duration-150">
                  Drop a PDF here to analyze
                </h3>
                <span className="hidden sm:inline rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  PDF up to 10 MB
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Fast document scanning and instant citation-ready answering
              </p>
            </div>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="accent"
              className="pointer-events-none h-8 px-3.5 group-hover:bg-zinc-800 dark:group-hover:bg-[#2a2a35] transition-colors duration-150"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Browse File</span>
            </Button>
          </div>
        </div>

        {/* Main Content Grid: Documents (Left 2/3) + Conversations (Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Recent Documents</h3>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {documents.length}
                </span>
              </div>
            </div>

            {/* Documents Card List */}
            <div className="space-y-3">
              {documents.map((doc) => {
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

                          {/* Processing state: simple small spinner & label */}
                          {doc.status !== "READY" && doc.status !== "FAILED" && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium select-none">
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>Analyzing...</span>
                            </span>
                          )}

                          {/* Ready tag: displayed only if the user has not yet opened the document */}
                          {doc.status === "READY" && !isOpened && <StatusBadge status="READY" />}

                          {/* Error state */}
                          {doc.status === "FAILED" && <StatusBadge status="FAILED" />}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                          <span>{doc.pageCount} pages</span>
                          <span className="text-zinc-300 dark:text-zinc-600">•</span>
                          <span>{(doc.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                          <span className="text-zinc-300 dark:text-zinc-600">•</span>
                          <span>{formatDate(doc.createdAt)}</span>
                        </div>

                        {/* Failure explanation if failed */}
                        {doc.error && (
                          <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
                            <span>{doc.error}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Primary Action Only */}
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
                              (
                              {conversations.filter((c) => c.documentIds.includes(doc.id)).length}
                              )
                            </span>
                          </Button>

                          <Link href={`/conversation?doc=${doc.id}`} onClick={() => markDocumentAsOpened(doc.id)}>
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
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <Link
                href="/documents"
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:underline transition-colors"
              >
                View and manage all documents →
              </Link>
            </div>
          </div>

          {/* Conversations Column (1 Col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Active Conversations</h3>
              <Link
                href="/conversations"
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:underline transition-colors"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {conversations.slice(0, 4).map((conv) => (
                <div
                  key={conv.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs hover:border-zinc-300 hover:bg-zinc-50/50 transition-all dark:border-white/10 dark:bg-[#141418] dark:hover:border-white/20 dark:hover:bg-[#18181f]"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(conv.updatedAt)}
                    </span>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600 font-medium dark:bg-zinc-800 dark:text-zinc-400">
                      {conv.messageCount} messages
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-1">{conv.title}</h4>

                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {conv.lastMessageSnippet || "No messages yet"}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5 dark:border-white/5">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <FileText className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                      <span>{conv.documentIds.length} doc linked</span>
                    </div>

                    <Link href={`/conversation?doc=${conv.documentIds[0] || "doc-1"}&conv=${conv.id}`}>
                      <Button size="sm" variant="ghost" className="h-7 text-xs font-medium gap-1">
                        <span>Resume</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
