"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocumentStore } from "@/stores/document-store";
import { useUIStore } from "@/stores/ui-store";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BottomGlow from "@/components/ui/BottomGlow";

import {
  ConversationsToolbar,
  ConversationFilterTab,
  ConversationSortOption,
} from "@/features/conversations/components/conversations-toolbar";
import {
  ConversationListRow,
  ConversationItemData,
} from "@/features/conversations/components/conversation-list-row";
import { ConversationGridCard } from "@/features/conversations/components/conversation-grid-card";
import { ConversationsEmptyState } from "@/features/conversations/components/conversations-empty-state";
import { useConversationsData } from "@/features/conversations/hooks/use-conversations-data";

export default function ConversationsPage() {
  const router = useRouter();

  // Zustand Store bindings
  const conversations = useConversationStore((state) => state.conversations);
  const fetchConversations = useConversationStore((state) => state.fetchConversations);
  const deleteConversation = useConversationStore((state) => state.deleteConversation);
  const renameConversation = useConversationStore((state) => state.renameConversation);
  const pinnedIds = useConversationStore((state) => state.pinnedIds);
  const togglePinConversation = useConversationStore((state) => state.togglePinConversation);

  const documents = useDocumentStore((state) => state.documents);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);

  const openUpload = useUIStore((state) => state.openUpload);

  // Filter & Toolbar States
  const [activeTab, setActiveTab] = useState<ConversationFilterTab>("all");
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>("all");
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<ConversationSortOption>("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");

  // Active / Selected conversation item
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Context menu & Delete states
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [convToDelete, setConvToDelete] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    fetchConversations();
    fetchDocuments();
  }, [fetchConversations, fetchDocuments]);

  // Close menus on outside click
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveMenuId(null);
      setIsSortOpen(false);
      setIsDocDropdownOpen(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  // Compute items, unique docs, filtered list
  const { uniqueDocNames, filteredItems } = useConversationsData({
    conversations,
    documents,
    pinnedIds,
    searchQuery,
    activeTab,
    selectedDocFilter,
    sortBy,
  });

  const handleOpenConversation = (item: ConversationItemData) => {
    setActiveItemId(item.id);
    router.push(`/conversation?doc=${item.docId}&conv=${item.id}`);
  };

  const handleDelete = () => {
    if (!convToDelete) return;
    deleteConversation(convToDelete.id);
    setConvToDelete(null);
  };

  const handleRename = (id: string, currentTitle: string) => {
    const newTitle = window.prompt("Rename conversation", currentTitle);
    if (newTitle && newTitle.trim()) {
      renameConversation(id, newTitle.trim());
    }
  };

  const handleShare = (id: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/conversation/${id}`);
    }
  };

  return (
    <>
      <div className="relative min-h-full w-full overflow-x-hidden pt-14 sm:pt-6 pb-28 sm:pb-12 select-none isolate">
        <div className="relative z-10 px-4 sm:px-8 py-2 sm:py-5 max-w-[1400px] mx-auto space-y-4 sm:space-y-6">
          {/* Controls Toolbar Bar */}
          <ConversationsToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedDocFilter={selectedDocFilter}
            onDocFilterChange={setSelectedDocFilter}
            uniqueDocNames={uniqueDocNames}
            isDocDropdownOpen={isDocDropdownOpen}
            onToggleDocDropdown={(open) =>
              setIsDocDropdownOpen((prev) => (open !== undefined ? open : !prev))
            }
            sortBy={sortBy}
            onSortChange={setSortBy}
            isSortOpen={isSortOpen}
            onToggleSortOpen={(open) =>
              setIsSortOpen((prev) => (open !== undefined ? open : !prev))
            }
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Conversations Content: List View or Grid View */}
          {filteredItems.length === 0 ? (
            <ConversationsEmptyState searchQuery={searchQuery} />
          ) : viewMode === "list" ? (
            /* List View */
            <div className="space-y-2 sm:space-y-2.5">
              {filteredItems.map((item) => (
                <ConversationListRow
                  key={item.id}
                  item={item}
                  isSelected={activeItemId === item.id}
                  isMenuOpen={activeMenuId === item.id}
                  onSelect={() => handleOpenConversation(item)}
                  onOpenMenu={() => setActiveMenuId(item.id)}
                  onCloseMenu={() => setActiveMenuId(null)}
                  onTogglePin={() => togglePinConversation(item.id)}
                  onShare={() => handleShare(item.id)}
                  onRename={() => handleRename(item.id, item.title)}
                  onRequestDelete={() =>
                    setConvToDelete({
                      id: item.id,
                      title: item.title,
                    })
                  }
                />
              ))}
            </div>
          ) : (
            /* Grid View Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {filteredItems.map((item) => (
                <ConversationGridCard
                  key={item.id}
                  item={item}
                  isSelected={activeItemId === item.id}
                  isMenuOpen={activeMenuId === item.id}
                  onSelect={() => handleOpenConversation(item)}
                  onOpenMenu={() => setActiveMenuId(item.id)}
                  onCloseMenu={() => setActiveMenuId(null)}
                  onTogglePin={() => togglePinConversation(item.id)}
                  onShare={() => handleShare(item.id)}
                  onRename={() => handleRename(item.id, item.title)}
                  onRequestDelete={() =>
                    setConvToDelete({
                      id: item.id,
                      title: item.title,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Subtle Atmospheric Bottom Glow */}
        <BottomGlow />
      </div>

      {/* Mobile Floating Action Button (FAB) for starting new conversation / upload */}
      <button
        type="button"
        onClick={openUpload}
        className="fixed bottom-20 right-5 z-30 sm:hidden flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-[0_0_24px_rgba(99,102,241,0.6)] border border-white/20 active:scale-95 transition-transform cursor-pointer"
        aria-label="New document conversation"
        title="New document conversation"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </button>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!convToDelete}
        onClose={() => setConvToDelete(null)}
        title="Delete Conversation?"
        description="Deleting a conversation permanently removes its question history. Your uploaded documents will NOT be deleted."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-zinc-400">
            Are you sure you want to delete &ldquo;{convToDelete?.title}&rdquo;?
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConvToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete Conversation
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
