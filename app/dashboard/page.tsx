"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { UploadModal } from "@/features/documents/upload-modal";
import {
  FileText,
  MessageSquare,
  ShieldCheck,
  Upload,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/stores/document-store";
import { useConversationStore } from "@/stores/conversation-store";
import { formatRelativeTime } from "@/lib/format-time";
import { useDocumentPolling } from "@/features/documents/hooks/use-document-polling";

// Exact sample items from the reference mockup
const REFERENCE_DOCS = [
  {
    id: "sample-1",
    originalName: "System Design Notes.pdf",
    pageCount: 24,
    fileSize: 3.2 * 1024 * 1024,
    timeText: "2 hours ago",
  },
  {
    id: "sample-2",
    originalName: "React Best Practices.pdf",
    pageCount: 18,
    fileSize: 1.8 * 1024 * 1024,
    timeText: "1 day ago",
  },
  {
    id: "sample-3",
    originalName: "Machine Learning Guide.pdf",
    pageCount: 42,
    fileSize: 5.6 * 1024 * 1024,
    timeText: "3 days ago",
  },
  {
    id: "sample-4",
    originalName: "Product Requirements.pdf",
    pageCount: 28,
    fileSize: 2.4 * 1024 * 1024,
    timeText: "5 days ago",
  },
];

const REFERENCE_CONVERSATIONS = [
  {
    id: "conv-ref-1",
    title: "Explain the system architecture",
    docName: "System Design Notes.pdf",
    docId: "sample-1",
    preview:
      "Here's a high-level overview of the system architecture described in your document...",
    timeText: "2 hours ago",
    isActive: true,
  },
  {
    id: "conv-ref-2",
    title: "Summarize key takeaways",
    docName: "React Best Practices.pdf",
    docId: "sample-2",
    preview:
      "The document outlines several important best practices for building maintainable...",
    timeText: "1 day ago",
    isActive: false,
  },
  {
    id: "conv-ref-3",
    title: "What are the main requirements?",
    docName: "Product Requirements.pdf",
    docId: "sample-4",
    preview:
      "Based on the document, the main requirements are: 1. User authentication...",
    timeText: "3 days ago",
    isActive: false,
  },
  {
    id: "conv-ref-4",
    title: "Compare approaches",
    docName: "Machine Learning Guide.pdf",
    docId: "sample-3",
    preview:
      "Here's a comparison of the approaches mentioned in your document...",
    timeText: "5 days ago",
    isActive: false,
  },
];

export function RedPdfBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-b from-[#ff4b4b] to-[#dc2626] text-white shadow-md shadow-red-500/25 border border-red-400/20",
        className
      )}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/90"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <span className="text-[9px] font-black uppercase font-sans tracking-tight leading-none mt-0.5">
        PDF
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const documents = useDocumentStore((state) => state.documents);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);
  const markDocumentAsOpened = useDocumentStore((state) => state.markDocumentAsOpened);

  const conversations = useConversationStore((state) => state.conversations);
  const fetchConversations = useConversationStore((state) => state.fetchConversations);
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchConversations();
  }, [fetchDocuments, fetchConversations]);

  useDocumentPolling();

  const displayDocuments =
    documents.length > 0
      ? documents.slice(0, 4).map((d) => ({
          id: d.id,
          originalName: d.originalName,
          pageCount: d.pageCount || 1,
          fileSize: d.fileSize || 1024 * 1024,
          timeText: formatRelativeTime(d.createdAt),
          isReal: true,
        }))
      : REFERENCE_DOCS.map((d) => ({ ...d, isReal: false }));

  const displayConversations =
    conversations.length > 0
      ? conversations.slice(0, 4).map((c, idx) => {
          const doc = documents.find((d) => c.documentIds.includes(d.id));
          return {
            id: c.id,
            title: c.title,
            docName: doc?.originalName || "Document",
            docId: doc?.id || "",
            preview:
              c.lastMessageSnippet ||
              "Click to view conversation insights and citations...",
            timeText: formatRelativeTime(c.updatedAt),
            isActive: idx === 0,
            isReal: true,
          };
        })
      : REFERENCE_CONVERSATIONS.map((c) => ({ ...c, isReal: false }));

  const handleOpenDoc = (docId: string, isReal: boolean) => {
    if (isReal) {
      markDocumentAsOpened(docId);
      router.push(`/conversation?doc=${docId}`);
    } else {
      setIsUploadOpen(true);
    }
  };

  const handleOpenConv = (convId: string, docId: string, isReal: boolean) => {
    if (isReal) {
      setActiveConversation(convId);
      router.push(`/conversation?doc=${docId}&conv=${convId}`);
    } else {
      setIsUploadOpen(true);
    }
  };

  return (
    <AppLayout title="Home">
      <div className="relative min-h-full px-4 sm:px-8 py-7 max-w-7xl mx-auto space-y-12 overflow-hidden">
        {/* =========================================================================
            ATMOSPHERIC AMBIENT NEBULA GLOWS (Eliminates flat feel)
           ========================================================================= */}
        <div className="absolute top-[-50px] right-[-50px] w-[650px] h-[550px] glow-ambient-blue blur-[80px] pointer-events-none -z-10" />
        <div className="absolute top-44 left-1/4 w-[450px] h-[450px] glow-ambient-purple blur-[80px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] glow-ambient-blue blur-[90px] pointer-events-none -z-10 opacity-60" />

        {/* =========================================================================
            HERO SECTION matching Image 1: Left Copy & Right Dropzone with Glow
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Column: Bold Headline & Micro-badges */}
          <div className="lg:col-span-7 space-y-5">
            {/* Eyebrow Pill */}
            <div className="inline-block">
              <span className="text-[11px] font-bold tracking-[0.22em] text-[#818cf8] uppercase">
                YOUR KNOWLEDGE. AMPLIFIED.
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.08]">
              Chat with <br />
              your{" "}
              <span className="bg-gradient-to-r from-[#e879f9] via-[#a855f7] to-[#38bdf8] bg-clip-text text-transparent">
                documents.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-[15px] text-zinc-400 max-w-lg leading-relaxed">
              Upload a PDF, ask questions, get instant answers with citations. Turn
              your documents into insights.
            </p>

            {/* Feature Micro-Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0c0e18]/80 px-3.5 py-2 text-xs text-zinc-300 shadow-sm">
                <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span>Accurate answers with citations</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0c0e18]/80 px-3.5 py-2 text-xs text-zinc-300 shadow-sm">
                <MessageSquare className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Multiple conversations per document</span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0c0e18]/80 px-3.5 py-2 text-xs text-zinc-300 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Secure & private</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dropzone Card with Outer Glow, Inner Dashed Box & Handwriting Arrow */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            {/* Playful Handwritten Annotation & Curved Arrow matching Image 1 */}
            <div className="absolute -top-7 -right-2 hidden sm:flex items-start gap-1 select-none pointer-events-none z-20">
              <div className="text-right font-handwriting text-[#a5b4fc] text-base sm:text-lg leading-tight pr-1">
                Upload<br />
                Ask<br />
                Discover
              </div>
              <svg
                width="36"
                height="50"
                viewBox="0 0 36 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#818cf8]"
              >
                <path
                  d="M28 2C24 16 12 24 6 38M6 38L2 31M6 38L13 36"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Glowing Dropzone Card Container */}
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
              className={cn(
                "w-full max-w-[440px] rounded-[28px] p-4 text-center relative transition-all duration-300",
                "dropzone-card-glow bg-[#0b0d18]/85 backdrop-blur-xl",
                isDragging && "scale-[1.02] border-indigo-400 bg-indigo-950/30 shadow-[0_0_60px_rgba(99,102,241,0.4)]"
              )}
            >
              {/* Inner Dashed Rectangle matching Image 1 */}
              <div className="border border-dashed border-[#252b49] rounded-2xl py-8 px-6 flex flex-col items-center justify-center">
                {/* Floating Document Icon with Fold */}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#141829] border border-[#2e375e] text-zinc-200 shadow-md">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                  </svg>
                </div>

                {/* Card Copy */}
                <h3 className="mt-4 text-sm sm:text-base font-semibold text-white tracking-tight">
                  Drop your PDF here
                </h3>
                <p className="text-[11px] text-zinc-500 my-1 font-medium">or</p>

                {/* Glowing Radiant Action Button */}
                <div className="mt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-[13px] text-white bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] shadow-[0_4px_22px_rgba(79,70,229,0.55),_inset_0_1px_1px_rgba(255,255,255,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-white/20"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Choose PDF</span>
                  </button>
                </div>

                {/* File Size Limit Subtext */}
                <p className="mt-5 text-[11px] text-zinc-400 font-medium">
                  Supports PDF files up to 50 MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RECENT DOCUMENTS SECTION matching Image 1: 4-Card Horizontal Grid
           ========================================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Link
              href="/documents"
              className="flex items-center gap-2 text-sm sm:text-base font-semibold text-white hover:text-indigo-400 transition-colors group"
            >
              <FileText className="h-4 w-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
              <span>Recent Documents</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleOpenDoc(doc.id, doc.isReal)}
                className="group relative flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#0b0d16] p-4 hover:border-white/15 hover:bg-[#101322] transition-all duration-200 cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Distinctive Red PDF Badge matching Image 1 */}
                  <RedPdfBadge />

                  {/* Document Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-[13px] font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {doc.originalName}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 truncate font-medium">
                      {doc.pageCount} pages • {(doc.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {doc.timeText}
                    </p>
                  </div>
                </div>

                {/* More Options Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDoc(doc.id, doc.isReal);
                  }}
                  className="rounded-lg p-1 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer shrink-0 ml-1"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            RECENT CONVERSATIONS SECTION matching Image 1: Highlighted Rows List
           ========================================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Link
              href="/conversations"
              className="flex items-center gap-2 text-sm sm:text-base font-semibold text-white hover:text-indigo-400 transition-colors group"
            >
              <MessageSquare className="h-4 w-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
              <span>Recent Conversations</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/conversations"
              className="text-xs text-zinc-400 hover:text-white transition-colors font-medium"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {displayConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleOpenConv(conv.id, conv.docId, conv.isReal)}
                className={cn(
                  "group relative flex items-center justify-between gap-4 rounded-2xl p-4 transition-all duration-200 cursor-pointer",
                  conv.isActive
                    ? "active-row-glow"
                    : "border border-white/[0.06] bg-[#0b0d14] hover:border-white/12 hover:bg-[#0f111e]"
                )}
              >
                {/* Left: Chat Icon & Title */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                      conv.isActive
                        ? "bg-indigo-950/80 text-indigo-400 border border-indigo-500/30"
                        : "bg-white/[0.04] text-zinc-400 border border-white/5"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </div>

                  {/* Title */}
                  <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[220px] shrink-0 group-hover:text-indigo-300 transition-colors">
                    {conv.title}
                  </span>

                  {/* Linked Document Pill Badge */}
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] text-zinc-300 shrink-0">
                    <FileText className="h-3 w-3 text-zinc-400" />
                    <span className="truncate max-w-[150px]">{conv.docName}</span>
                  </div>

                  {/* Snippet preview */}
                  <span className="hidden lg:inline text-xs text-zinc-400 truncate flex-1 min-w-0 font-normal">
                    {conv.preview}
                  </span>
                </div>

                {/* Right: Relative Timestamp & Menu */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-zinc-500">{conv.timeText}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenConv(conv.id, conv.docId, conv.isReal);
                    }}
                    className="rounded-lg p-1 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Ingestion Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {
          fetchDocuments();
        }}
      />
    </AppLayout>
  );
}
