"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Conversation } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { ConversationItem } from "./conversation-item";
import { DeleteConversationDialog } from "./delete-conversation-dialog";

export interface ConversationListProps {
  documentId: string;
  isCollapsed: boolean;
  onClose?: () => void;
  // Optional overrides for flexible usage and testing
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

  // Zustand selectors following strict selector rule
  const storeConversations = useConversationStore((state) => state.conversations);
  const storeActiveId = useConversationStore(
    (state) => state.activeConversationId
  );
  const switchConversation = useConversationStore(
    (state) => state.switchConversation
  );
  const createConversation = useConversationStore(
    (state) => state.createConversation
  );
  const deleteConversation = useConversationStore(
    (state) => state.deleteConversation
  );

  // Local state for conversation deletion confirmation modal
  const [convToDelete, setConvToDelete] = useState<Conversation | null>(null);

  // Derive conversations if not explicitly provided via props
  const conversations =
    propConversations ??
    storeConversations
      .filter((c) => c.documentIds.includes(documentId))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

  const activeId =
    propActiveConversationId !== undefined
      ? propActiveConversationId
      : storeActiveId;

  const handleSelect = (convId: string) => {
    if (onSelectConversation) {
      onSelectConversation(convId);
      return;
    }
    switchConversation(convId);
    router.push(`/conversation?doc=${documentId}&conv=${convId}`);
    onClose?.();
  };

  const handleCreate = () => {
    if (onCreateConversation) {
      onCreateConversation();
      return;
    }
    const newConvId = createConversation(documentId);
    router.push(`/conversation?doc=${documentId}&conv=${newConvId}`);
    onClose?.();
  };

  return (
    <>
      <div className="space-y-0.5">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <span>Conversations</span>
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-500 dark:bg-white/5 dark:text-zinc-400 leading-none">
              {conversations.length}
            </span>
          </div>
        )}

        {/* Conversation Items List */}
        {conversations.length === 0 ? (
          <div className="p-3 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No conversations yet.
            </p>
            <button
              onClick={handleCreate}
              className="mt-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:underline cursor-pointer"
            >
              Start conversation
            </button>
          </div>
        ) : (
          conversations.map((conv) => (
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

      {/* Delete Conversation Confirmation Dialog encapsulated inside the list */}
      <DeleteConversationDialog
        conversation={convToDelete}
        onClose={() => setConvToDelete(null)}
        onConfirm={deleteConversation}
      />
    </>
  );
}
