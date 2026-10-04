"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Conversation } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocumentConversations, useDeleteConversation } from "../hooks/use-conversations";
import { DeleteConversationDialog } from "./delete-conversation-dialog";
import { RecentsRow, RecentsRowSkeleton } from "@/components/layout/sidebar-recents";
import { getConversationPath } from "@/features/conversations/utils/conversation-url";

export interface ConversationListProps {
  documentId?: string | null;
  isCollapsed: boolean;
  onClose?: () => void;
  conversations?: Conversation[];
  activeConversationId?: string | null;
}

export function ConversationList({
  documentId,
  isCollapsed,
  onClose,
  conversations: propConversations,
  activeConversationId: propActiveConversationId,
}: ConversationListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlConvId = searchParams?.get("conv");
  const { conversations: documentConversations, isLoading } = useDocumentConversations(documentId);
  const storeActiveId = useConversationStore((state) => state.activeConversationId);
  const switchConversation = useConversationStore((state) => state.switchConversation);
  const { mutate: deleteConversation } = useDeleteConversation();

  const [convToDelete, setConvToDelete] = useState<Conversation | null>(null);

  const conversations = propConversations ?? documentConversations;

  const activeId = propActiveConversationId !== undefined ? propActiveConversationId : (urlConvId ?? storeActiveId);

  const handleSelect = (convId: string) => {
    switchConversation(convId);
    router.push(getConversationPath(convId, documentId));
    onClose?.();
  };

  const handleCreate = () => {
    useConversationStore.getState().setActiveConversation(null);
    router.push(getConversationPath(null, documentId));
    onClose?.();
  };

  if (isLoading && !propConversations) {
    if (isCollapsed) {
      return (
        <div className="space-y-1.5 pt-2 flex flex-col items-center">
          <div className="h-8 w-8 rounded-xl bg-white/[0.05] animate-pulse" />
          <div className="h-8 w-8 rounded-xl bg-white/[0.05] animate-pulse" />
          <div className="h-8 w-8 rounded-xl bg-white/[0.05] animate-pulse" />
        </div>
      );
    }

    return (
      <div className="space-y-1.5 mx-2 pt-4 select-none">
        <div className="flex items-center justify-between px-2.5 text-[9.5px] font-bold tracking-widest text-zinc-500 uppercase">
          <span>CONVERSATIONS</span>
          <div className="h-2.5 w-4 rounded-full bg-black/[0.05] dark:bg-white/[0.05] animate-pulse" />
        </div>
        <div className="space-y-1 pt-1">
          <RecentsRowSkeleton width="70%" />
          <RecentsRowSkeleton width="50%" />
          <RecentsRowSkeleton width="80%" />
          <RecentsRowSkeleton width="60%" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1.5 mx-2 pt-4 select-none">
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between px-2.5 text-[9.5px] font-bold tracking-widest text-zinc-500 uppercase">
              <span>CONVERSATIONS</span>
              <span className="font-mono text-zinc-500 text-[10px]">{conversations.length}</span>
            </div>
          </>
        )}

        {/* Conversation Items List */}
        <div className="space-y-1 pt-1">
          {conversations.length === 0 ? (
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
            conversations.map((conv) => (
              <RecentsRow
                isActive={conv.id === activeId}
                key={conv.id}
                conversation={conv}
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
