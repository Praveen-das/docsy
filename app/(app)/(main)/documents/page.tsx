"use client";

import { useState, useEffect } from "react";
import { FileText, Plus } from "lucide-react";
import { Document } from "@/types";
import { useDocumentStore } from "@/stores/document-store";
import {
  useDocuments,
  useDeleteDocument,
  useReprocessDocument,
  useCheckDocumentStatus,
  useToggleFavoriteDocument,
} from "@/features/documents/hooks/use-documents";
import { useConversationStore } from "@/stores/conversation-store";
import { useConversations } from "@/features/conversations/hooks/use-conversations";
import { useUIStore } from "@/stores/ui-store";
import { DocumentConversationsDialog } from "@/features/conversations/document-conversations-dialog";
import { useDocumentFilters } from "@/features/documents/hooks/use-document-filters";
import { DocumentToolbar, DocumentViewMode } from "@/features/documents/components/document-toolbar";
import { DocumentCard } from "@/features/documents/components/document-card";
import { DocumentListRow } from "@/features/documents/components/document-list-row";
import { DeleteDocumentDialog } from "@/features/documents/components/delete-document-dialog";
import { DocumentsEmptyState } from "@/features/documents/components/documents-empty-state";
import BottomGlow from "@/components/ui/BottomGlow";

export default function DocumentsPage() {
  const { data: documents = [] } = useDocuments();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  const { mutateAsync: reprocessDocument } = useReprocessDocument();
  const { mutateAsync: checkDocumentStatus } = useCheckDocumentStatus();
  const { mutateAsync: toggleFavoriteDocument } = useToggleFavoriteDocument();
  const openedDocumentIds = useDocumentStore((state) => state.openedDocumentIds);
  const markDocumentAsOpened = useDocumentStore((state) => state.markDocumentAsOpened);

  const { conversations } = useConversations();

  const openUpload = useUIStore((state) => state.openUpload);

  // Filter, search, and sorting hook
  const { searchQuery, setSearchQuery, activeTab, setActiveTab, sortBy, setSortBy, filteredAndSortedDocuments } =
    useDocumentFilters({ documents });

  // UI state
  const [viewMode, setViewMode] = useState<DocumentViewMode>("grid");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [checkingDocId, setCheckingDocId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [conversationsDoc, setConversationsDoc] = useState<Document | null>(null);
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);


  // Close menus on outside click
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveMenuDocId(null);
      setIsSortDropdownOpen(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const handleForceCheck = async (docId: string) => {
    setCheckingDocId(docId);
    try {
      await checkDocumentStatus(docId);
    } finally {
      setCheckingDocId(null);
    }
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDocument(docToDelete.id);
      setDocToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReprocess = async (docId: string) => {
    await reprocessDocument(docId);
  };

  const getDocConversationsCount = (docId: string) => {
    return conversations.filter((c) => c.documentIds.includes(docId)).length;
  };

  const hasRealDocs = documents.length > 0;

  return (
    <>
      <div className="relative min-h-full w-full overflow-x-hidden pt-14 sm:pt-6 pb-28 sm:pb-12 select-none isolate">
        <div className="relative z-10 px-4 sm:px-8 py-2 sm:py-5 max-w-[1400px] mx-auto space-y-4 sm:space-y-6">
          {/* Controls Bar: Filter Tabs, Expandable Search, Sort & View Switcher */}
          <DocumentToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearchExpanded={isSearchExpanded}
            onToggleSearch={setIsSearchExpanded}
            sortBy={sortBy}
            onSortChange={setSortBy}
            isSortOpen={isSortDropdownOpen}
            onToggleSort={setIsSortDropdownOpen}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Document Content View: Grid or List */}
          {hasRealDocs && filteredAndSortedDocuments.length === 0 ? (
            <DocumentsEmptyState />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredAndSortedDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  conversationCount={getDocConversationsCount(doc.id)}
                  isChecking={checkingDocId === doc.id}
                  onOpenConversations={setConversationsDoc}
                  onDelete={setDocToDelete}
                  onOpenDocument={markDocumentAsOpened}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedDocuments.map((doc) => {
                const isOpened = openedDocumentIds.includes(doc.id) || !!doc.hasOpened;
                return (
                  <DocumentListRow
                    key={doc.id}
                    document={doc}
                    conversationCount={getDocConversationsCount(doc.id)}
                    isOpened={isOpened}
                    isFavorite={Boolean(doc.isFavorite)}
                    onToggleFavorite={toggleFavoriteDocument}
                    isChecking={checkingDocId === doc.id}
                    onOpenConversations={setConversationsDoc}
                    onCheckStatus={handleForceCheck}
                    onReprocess={handleReprocess}
                    onDelete={setDocToDelete}
                    onOpenDocument={markDocumentAsOpened}
                  />
                );
              })}
            </div>
          )}

          {/* Bottom Empty / Pagination Status Box */}
          <div className="rounded-[22px] border border-dashed border-white/[0.08] bg-[#0c1017]/40 p-6 sm:p-10 text-center select-none backdrop-blur-xs will-change-transform">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-[#727f9d] mb-2">
              <FileText className="h-5 w-5 stroke-[1.8]" />
            </div>
            <h4 className="text-[13.5px] font-semibold text-[#f1f3f9]">No more documents</h4>
            <p className="text-[12px] text-[#818ea8] mt-1 max-w-xs mx-auto">
              Upload more PDFs to continue building your knowledge base.
            </p>
          </div>
        </div>

        {/* Subtle Atmospheric Bottom Glow */}
        <BottomGlow />
      </div>

      {/* Mobile Floating Action Button (FAB) matching reference image */}
      <button
        type="button"
        onClick={() => openUpload()}
        className="fixed bottom-20 right-5 z-30 sm:hidden flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.6)] border border-white/20 active:scale-95 transition-transform cursor-pointer"
        aria-label="Upload document"
        title="Upload document"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </button>

      {/* Delete Document Confirmation Dialog */}
      <DeleteDocumentDialog
        document={docToDelete}
        isOpen={!!docToDelete}
        isDeleting={isDeleting}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDelete}
      />

      {/* Document Conversations Modal */}
      <DocumentConversationsDialog
        isOpen={!!conversationsDoc}
        onClose={() => setConversationsDoc(null)}
        document={conversationsDoc}
      />
    </>
  );
}
