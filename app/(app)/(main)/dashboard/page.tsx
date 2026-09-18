"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { useDocumentStore } from "@/stores/document-store";
import { useConversationStore } from "@/stores/conversation-store";
import { formatRelativeTime } from "@/lib/format-time";
import { useDocumentPolling } from "@/features/documents/hooks/use-document-polling";
import { DashboardHero } from "@/features/dashboard/components/dashboard-hero";
import {
  RecentDocumentsSection,
  DashboardDocumentItem,
} from "@/features/dashboard/components/recent-documents-section";
import {
  RecentConversationsSection,
  DashboardConversationItem,
} from "@/features/dashboard/components/recent-conversations-section";

export { RedPdfBadge } from "@/features/dashboard/components/red-pdf-badge";

// Exact sample items from the reference mockup
const REFERENCE_DOCS: DashboardDocumentItem[] = [
  {
    id: "sample-1",
    originalName: "System Design Notes.pdf",
    pageCount: 24,
    fileSize: 3.2 * 1024 * 1024,
    timeText: "2 hours ago",
    isReal: false,
  },
  {
    id: "sample-2",
    originalName: "React Best Practices.pdf",
    pageCount: 18,
    fileSize: 1.8 * 1024 * 1024,
    timeText: "1 day ago",
    isReal: false,
  },
  {
    id: "sample-3",
    originalName: "Machine Learning Guide.pdf",
    pageCount: 42,
    fileSize: 5.6 * 1024 * 1024,
    timeText: "3 days ago",
    isReal: false,
  },
  {
    id: "sample-4",
    originalName: "Product Requirements.pdf",
    pageCount: 28,
    fileSize: 2.4 * 1024 * 1024,
    timeText: "5 days ago",
    isReal: false,
  },
];

const REFERENCE_CONVERSATIONS: DashboardConversationItem[] = [
  {
    id: "conv-ref-1",
    title: "Explain the system architecture",
    docName: "System Design Notes.pdf",
    docId: "sample-1",
    preview: "Here's a high-level overview of the system architecture described in your document...",
    timeText: "2 hours ago",
    isActive: true,
    isReal: false,
  },
  {
    id: "conv-ref-2",
    title: "Summarize key takeaways",
    docName: "React Best Practices.pdf",
    docId: "sample-2",
    preview: "The document outlines several important best practices for building maintainable...",
    timeText: "1 day ago",
    isActive: false,
    isReal: false,
  },
  {
    id: "conv-ref-3",
    title: "What are the main requirements?",
    docName: "Product Requirements.pdf",
    docId: "sample-4",
    preview: "Based on the document, the main requirements are: 1. User authentication...",
    timeText: "3 days ago",
    isActive: false,
    isReal: false,
  },
  {
    id: "conv-ref-4",
    title: "Compare approaches",
    docName: "Machine Learning Guide.pdf",
    docId: "sample-3",
    preview: "Here's a comparison of the approaches mentioned in your document...",
    timeText: "5 days ago",
    isActive: false,
    isReal: false,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const documents = useDocumentStore((state) => state.documents);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);
  const markDocumentAsOpened = useDocumentStore((state) => state.markDocumentAsOpened);

  const conversations = useConversationStore((state) => state.conversations);
  const fetchConversations = useConversationStore((state) => state.fetchConversations);
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);

  const openUpload = useUIStore((state) => state.openUpload);

  useEffect(() => {
    fetchDocuments();
    fetchConversations();
  }, [fetchDocuments, fetchConversations]);

  useDocumentPolling();

  const displayDocuments: DashboardDocumentItem[] =
    documents.length > 0
      ? documents.slice(0, 4).map((d) => ({
          id: d.id,
          originalName: d.originalName,
          pageCount: d.pageCount || 1,
          fileSize: d.fileSize || 1024 * 1024,
          timeText: formatRelativeTime(d.createdAt),
          isReal: true,
        }))
      : REFERENCE_DOCS;

  const displayConversations: DashboardConversationItem[] =
    conversations.length > 0
      ? conversations.slice(0, 4).map((c, idx) => {
          const doc = documents.find((d) => c.documentIds.includes(d.id));
          return {
            id: c.id,
            title: c.title,
            docName: doc?.originalName || "Document",
            docId: doc?.id || "",
            preview: c.lastMessageSnippet || "Click to view conversation insights and citations...",
            timeText: formatRelativeTime(c.updatedAt),
            isActive: idx === 0,
            isReal: true,
          };
        })
      : REFERENCE_CONVERSATIONS;

  const handleOpenDoc = (docId: string, isReal: boolean) => {
    if (isReal) {
      markDocumentAsOpened(docId);
      router.push(`/conversation?doc=${docId}`);
    } else {
      openUpload();
    }
  };

  const handleOpenConv = (convId: string, docId: string, isReal: boolean) => {
    if (isReal) {
      setActiveConversation(convId);
      router.push(`/conversation?doc=${docId}&conv=${convId}`);
    } else {
      openUpload();
    }
  };

  return (
    <div className="relative min-h-full w-full overflow-x-hidden">
      {/* Atmospheric Ambient Nebula Glows */}

      <div className="relative px-4 sm:px-8 py-7 max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <DashboardHero onOpenUpload={openUpload} />

        {/* Recent Documents */}
        <RecentDocumentsSection documents={displayDocuments} onOpenDoc={handleOpenDoc} />

        {/* Recent Conversations */}
        <RecentConversationsSection conversations={displayConversations} onOpenConv={handleOpenConv} />
      </div>

      {/* Subtle Atmospheric Bottom Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-none h-1/2 select-none overflow-hidden z-0 transform-gpu"
      >
        <div className="w-full h-full hero-bottom-glow opacity-30" />
      </div>
    </div>
  );
}
