"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Conversation } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { ConversationItem } from "./conversation-item";
import { DeleteConversationDialog } from "./delete-conversation-dialog";
import { Search } from "lucide-react";

export interface ConversationListProps {
  documentId?: string | null;
  isCollapsed: boolean;
  onClose?: () => void;
  conversations?: Conversation[];
  activeConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onCreateConversation?: () => void;
}

export function ConversationList({
  documentId,
  isCollapsed,
  onClose,
  conversations: propConversations,
  activeConversationId: propActiveConversationId,
  onSelectConversation,
  onCreateConversation,
}: ConversationListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const storeConversations = useConversationStore((state) => state.conversations);
  const storeActiveId = useConversationStore((state) => state.activeConversationId);
  const switchConversation = useConversationStore((state) => state.switchConversation);
  const deleteConversation = useConversationStore((state) => state.deleteConversation);

  const [convToDelete, setConvToDelete] = useState<Conversation | null>(null);

  const rawConversations =
    propConversations ??
    (documentId
      ? storeConversations
          .filter((c) => c.documentIds.includes(documentId))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      : storeConversations);

  const filteredConversations = rawConversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeId =
    propActiveConversationId !== undefined ? propActiveConversationId : storeActiveId;

  const handleSelect = (convId: string) => {
    if (onSelectConversation) {
      onSelectConversation(convId);
      return;
    }
    switchConversation(convId);
    if (documentId) {
      router.push(`/conversation?doc=${documentId}&conv=${convId}`);
    } else {
      router.push(`/conversation?conv=${convId}`);
    }
    onClose?.();
  };

  const handleCreate = () => {
    if (onCreateConversation) {
      onCreateConversation();
      return;
    }
    useConversationStore.getState().setActiveConversation(null);
    if (documentId) {
      router.push(`/conversation?doc=${documentId}`);
    } else {
      router.push(`/conversation`);
    }
    onClose?.();
  };

  return (
    <>
      <div className="space-y-2 select-none">
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between px-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              <span>CONVERSATIONS</span>
              <span className="font-mono text-zinc-500 text-[10px]">
                {filteredConversations.length}
              </span>
            </div>

            {/* Search conversations input matching Image 2 */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-white/[0.06] bg-[#0c0e15] pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-indigo-500/40 focus:outline-none transition-colors"
              />
            </div>
          </>
        )}

        {/* Conversation Items List */}
        <div className="space-y-1 pt-1">
          {filteredConversations.length === 0 ? (
            <div className="py-4 px-2 text-center">
              <p className="text-xs text-zinc-500">No conversations yet.</p>
              <button
                onClick={handleCreate}
                className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                + New conversation
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeId === conv.id}
                isCollapsed={isCollapsed}
                onSelect={() => handleSelect(conv.id)}
                onDelete={() => setConvToDelete(conv)}
              />
            ))
          )}
        </div>
      </div>

      <DeleteConversationDialog
        conversation={convToDelete}
        onClose={() => setConvToDelete(null)}
        onConfirm={deleteConversation}
      />
    </>
  );
}
