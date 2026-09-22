"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Document } from "@/types";
import { useDocumentStore } from "@/stores/document-store";
import { useConversationStore } from "@/stores/conversation-store";
import { DocumentConversationsDialog } from "@/features/conversations/document-conversations-dialog";
import { useDocumentPolling } from "@/features/documents/hooks/use-document-polling";
import { useDocumentFilters } from "@/features/documents/hooks/use-document-filters";
import { DocumentToolbar, DocumentViewMode } from "@/features/documents/components/document-toolbar";
import { DocumentCard } from "@/features/documents/components/document-card";
import { DocumentListRow } from "@/features/documents/components/document-list-row";
import { DeleteDocumentDialog } from "@/features/documents/components/delete-document-dialog";
import { DocumentsEmptyState } from "@/features/documents/components/documents-empty-state";
import BottomGlow from "@/components/ui/BottomGlow";

export default function DocumentsPage() {
  const documents = useDocumentStore((state) => state.documents);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);
  const deleteDocument = useDocumentStore((state) => state.deleteDocument);
  const reprocessDocument = useDocumentStore((state) => state.reprocessDocument);
  const checkDocumentStatus = useDocumentStore((state) => state.checkDocumentStatus);
  const openedDocumentIds = useDocumentStore((state) => state.openedDocumentIds);
  const markDocumentAsOpened = useDocumentStore((state) => state.markDocumentAsOpened);
  const favoriteDocumentIds = useDocumentStore((state) => state.favoriteDocumentIds);
  const toggleFavoriteDocument = useDocumentStore((state) => state.toggleFavoriteDocument);

  const conversations = useConversationStore((state) => state.conversations);
  const fetchConversations = useConversationStore((state) => state.fetchConversations);

  // Filter, search, and sorting hook
  const { searchQuery, setSearchQuery, activeTab, setActiveTab, sortBy, setSortBy, filteredAndSortedDocuments } =
    useDocumentFilters({ documents, favoriteDocumentIds });

  // UI state
  const [viewMode, setViewMode] = useState<DocumentViewMode>("grid");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [checkingDocId, setCheckingDocId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [conversationsDoc, setConversationsDoc] = useState<Document | null>(null);
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchConversations();
  }, [fetchDocuments, fetchConversations]);

  // Close menus on outside click
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveMenuDocId(null);
      setIsSortDropdownOpen(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // Auto-refresh when any document is actively processing
  useDocumentPolling();

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

  console.log(filteredAndSortedDocuments);

  return (
    <>
      <div className="relative min-h-full w-full overflow-x-hidden pt-12 pb-20 select-none isolate">
        <div className="relative z-10 px-4 sm:px-8 py-7 max-w-[1400px] mx-auto space-y-8">
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
                    isFavorite={doc.isFavorite ?? favoriteDocumentIds.includes(doc.id)}
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
          <div className="rounded-[22px] border border-dashed border-white/[0.07] bg-[#0c1017]/40 p-8 sm:p-10 text-center select-none backdrop-blur-xs will-change-transform">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-[#727f9d] mb-2">
              <FileText className="h-5 w-5 stroke-[1.8]" />
            </div>
            <h4 className="text-[13.5px] font-semibold text-[#f1f3f9]">No more documents</h4>
            <p className="text-[12px] text-[#818ea8] mt-1">
              Upload more PDFs to continue building your knowledge base.
            </p>
          </div>
        </div>

        {/* Subtle Atmospheric Bottom Glow */}
        <BottomGlow />
      </div>

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
