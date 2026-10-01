"use client";

import { useEffect } from "react";
import { useConversationStore } from "@/stores/conversation-store";

export function useChatSessionSync(
  activeConvId: string,
  activeStreamChannelId?: string,
  streamToken?: string,
) {
  const resumeActiveStream = useConversationStore((s) => s.resumeActiveStream);

  // Auto-resume in-flight stream on reload or conversation switch
  useEffect(() => {
    if (activeConvId && activeStreamChannelId) {
      resumeActiveStream(activeConvId);
    }
  }, [activeConvId, activeStreamChannelId, resumeActiveStream]);

  // Pre-seed streamToken for active conversation if available
  useEffect(() => {
    if (activeConvId && streamToken) {
      const store = useConversationStore.getState();
      if (!store.getStreamToken(activeConvId)) {
        store.setStreamToken(activeConvId, streamToken);
      }
    }
  }, [activeConvId, streamToken]);
}
