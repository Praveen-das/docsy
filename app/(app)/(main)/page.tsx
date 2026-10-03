"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useDocumentStore } from "@/stores/document-store";
import { useDocuments, useDeleteDocument } from "@/features/documents/hooks/use-documents";
import { useConversationStore } from "@/stores/conversation-store";
import { useRecentConversations } from "@/features/conversations/hooks/use-conversations";
import { formatRelativeTime } from "@/lib/format-time";
import { DashboardHero } from "@/features/dashboard/components/dashboard-hero";
import { DeleteDocumentDialog } from "@/features/documents/components/delete-document-dialog";
import { RecentDocumentsSection } from "@/features/dashboard/components/recent-documents-section";
import {
  RecentConversationsSection,
  DashboardConversationItem,
} from "@/features/dashboard/components/recent-conversations-section";
import { Document } from "@/types";
import BottomGlow from "@/components/ui/BottomGlow";



export default function HomePage() {
  const router = useRouter();
  const { data: documents = [] } = useDocuments();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  const markDocumentAsOpened = useDocumentStore((state) => state.markDocumentAsOpened);

  const { conversations, pinnedIds } = useRecentConversations();
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);

  const openUpload = useUIStore((state) => state.openUpload);

  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDocument(docToDelete.id);
      setDocToDelete(null);
    } catch {
      // Error handled in mutation hook
    } finally {
      setIsDeleting(false);
    }
  };

  const displayDocuments = documents.slice(0, 4);

  const displayConversations: DashboardConversationItem[] = conversations
    .slice(0, 4)
    .map((c, idx) => {
      const doc = documents.find((d) => c.documentIds.includes(d.id));
      return {
        id: c.id,
        title: c.title,
        docName: doc?.originalName || "Document",
        docId: doc?.id || "",
        preview: c.lastMessageSnippet || "Click to view conversation insights and citations...",
        timeText: formatRelativeTime(c.updatedAt),
        isActive: idx === 0,
        isPinned: pinnedIds.has(c.id),
        isReal: true,
      };
    });

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
    <div className="relative min-h-full w-full overflow-x-hidden pt-14 sm:pt-6 pb-28 sm:pb-12 select-none isolate">
      {/* Atmospheric Ambient Nebula Glows */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-2 sm:py-5 max-w-7xl mx-auto space-y-6 sm:space-y-10">
        {/* Hero Section */}
        <DashboardHero />

        {/* Recent Documents */}
        <RecentDocumentsSection
          documents={displayDocuments}
          onOpenDoc={handleOpenDoc}
          onDelete={setDocToDelete}
        />

        {/* Recent Conversations */}
        <RecentConversationsSection conversations={displayConversations} onOpenConv={handleOpenConv} />
      </div>

      {/* Mobile Floating Action Button (FAB) for instant document upload */}
      <button
        type="button"
        onClick={openUpload}
        className="fixed bottom-20 right-5 z-30 sm:hidden flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.6)] border border-white/20 active:scale-95 transition-transform cursor-pointer"
        aria-label="Upload document"
        title="Upload document"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </button>

      {/* Delete Confirmation Modal */}
      <DeleteDocumentDialog
        isOpen={Boolean(docToDelete)}
        isDeleting={isDeleting}
        document={docToDelete}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDocToDelete(null)}
      />

      {/* Subtle Atmospheric Bottom Glow */}
      <BottomGlow />
    </div>
  );
}
