"use client";

import { useEffect, useRef } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { PaginatedMessagesResponse } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";

/**
 * Hook to optimistically sync regenerated message content into the React Query infinite cache
 * when AI streaming finishes, ensuring immediate visibility before the server refetch lands.
 */
export function useSyncRegeneratedCache(
  activeConvId: string,
  isLoadingAi: boolean,
  regeneratingMessageId: string | null
) {
  const queryClient = useQueryClient();
  const prevLoadingRef = useRef(false);
  const lastKnownRegIdRef = useRef<string | null>(null);

  if (regeneratingMessageId) {
    lastKnownRegIdRef.current = regeneratingMessageId;
  }

  useEffect(() => {
    if (prevLoadingRef.current && !isLoadingAi && activeConvId) {
      const finishedRegId = lastKnownRegIdRef.current;

      if (finishedRegId) {
        const session = useConversationStore.getState().sessionMessages[activeConvId] || [];
        const regeneratedMsg = session.find((m) => m.id === finishedRegId);

        if (regeneratedMsg) {
          queryClient.setQueryData<InfiniteData<PaginatedMessagesResponse>>(
            ["conversations", activeConvId, "messages"],
            (oldData) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  messages: page.messages.map((m) =>
                    m.id === finishedRegId ? { ...m, content: regeneratedMsg.content } : m
                  ),
                })),
              };
            }
          );
        }

        lastKnownRegIdRef.current = null;
      }

      queryClient.invalidateQueries({ queryKey: ["conversations", activeConvId, "messages"] });
    }
    prevLoadingRef.current = isLoadingAi;
  }, [isLoadingAi, activeConvId, queryClient]);
}
