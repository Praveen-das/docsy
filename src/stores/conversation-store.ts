"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { api, registerTokenHandlers } from "@/lib/api-client";
import { isDefaultTitle } from "@/lib/title-utils";
import { Conversation, Message, Document } from "@/types";

interface ConversationState {
  conversations: Conversation[];
  sessionMessages: Record<string, Message[]>;
  drafts: Record<string, string>;
  activeConversationId: string | null;
  isLoadingAi: boolean;
  isAiTyping: boolean;
  streamingContent: string | null;
  regeneratingMessageId: string | null;
  isLoadingConversations: boolean;
  error: string | null;

  // Actions
  setActiveConversation: (convId: string | null) => void;
  setStreamToken: (convId: string, token: string) => void;
  fetchConversations: () => Promise<void>;
  createConversation: (documentId: string, initialTitle?: string) => Promise<string>;
  switchConversation: (targetConvId: string, currentDraft?: string) => void;
  saveDraft: (convId: string, draft: string) => void;
  renameConversation: (convId: string, newTitle: string) => Promise<void>;
  deleteConversation: (convId: string) => Promise<void>;
  clearSessionMessages: (convId: string) => void;
  syncConversationTitle: (convId: string) => Promise<void>;
  pollConversationTitle: (convId: string, initialTitle: string) => void;
  sendMessage: (
    convId: string,
    content: string,
    options?: { priorMessages?: Message[]; activeDoc?: Document } | Document,
  ) => Promise<void>;
  editMessage: (convId: string, messageId: string, newContent: string) => Promise<void>;
  regenerateMessage: (
    convId: string,
    assistantMessageId: string,
    options: {
      promptContent: string;
      conversationHistory?: { role: "user" | "assistant"; content: string }[];
    },
  ) => Promise<void>;
  deleteMessage: (convId: string, messageId: string) => Promise<void>;
  resetToDefaults: () => void;
}

/**
 * Factory function to create standardized client-side message records.
 */
export function createMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content = "",
  options?: { id?: string; createdAt?: string },
): Message {
  const prefix = role === "user" ? "user" : role === "assistant" ? "ai" : "sys";
  return {
    id: options?.id || `msg-${prefix}-${Date.now()}`,
    conversationId,
    role,
    content,
    ...(role === "assistant" ? { sources: [] } : {}),
    createdAt: options?.createdAt || new Date().toISOString(),
  };
}

/**
 * Factory function to create standardized client-side conversation records for optimistic UI.
 */
export function createClientConversation(
  documentId: string | string[],
  title: string,
  options?: {
    id?: string;
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
    streamToken?: string;
  },
): Conversation {
  const id =
    options?.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `conv-${Date.now()}`);
  const now = options?.createdAt || new Date().toISOString();

  return {
    id,
    userId: options?.userId || "current-user",
    title,
    documentIds: Array.isArray(documentId) ? documentId : [documentId],
    lastMessageSnippet: undefined,
    messageCount: 0,
    createdAt: now,
    updatedAt: options?.updatedAt || now,
    streamToken: options?.streamToken,
  };
}

/** Active poll interval timers per conversation ID to prevent duplicate polling */
const activePollTimers = new Map<string, NodeJS.Timeout>();

interface ExecuteChatStreamOptions {
  convId: string;
  assistantMessageId: string;
  content: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  skipUserPersistence?: boolean;
  replaceAssistantMessageId?: string;
  set: (fn: (state: ConversationState) => Partial<ConversationState>) => void;
  get: () => ConversationState;
}

/**
 * Reusable durable streaming helper executing realtime Upstash reader and workflow invocation.
 */
async function executeChatStream({
  convId,
  assistantMessageId,
  content,
  conversationHistory,
  skipUserPersistence,
  replaceAssistantMessageId,
  set,
  get,
}: ExecuteChatStreamOptions): Promise<void> {
  let rafId: number | null = null;
  const state = get();

  try {
    const currentConv = state.conversations.find((c) => c.id === convId);
    const conversationToken = currentConv?.streamToken;

    // Use a unique ephemeral channel ID per stream invocation so
    // channel.history() never replays chunks from a previous generation.
    const streamChannelId = replaceAssistantMessageId
      ? `regen-${assistantMessageId}-${Date.now()}`
      : assistantMessageId;

    const [res] = await Promise.all([
      api.get<ReadableStream<Uint8Array>>(`/api/conversations/${convId}/messages/stream?id=${streamChannelId}`, {
        responseType: "stream",
        adapter: "fetch",
      }),
      api.post(`/api/conversations/${convId}/messages/stream`, {
        messageId: assistantMessageId,
        streamChannelId,
        conversationId: convId,
        content,
        conversationHistory,
        conversationToken,
        skipUserPersistence,
        replaceAssistantMessageId,
      }),
    ]);

    const stream = res.data;
    const reader =
      stream?.getReader?.() || (stream as unknown as { body?: ReadableStream<Uint8Array> })?.body?.getReader?.();
    if (!reader) {
      throw new Error("No readable stream response from server");
    }

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const rawChunk = decoder.decode(value, { stream: true });
      if (rawChunk.includes("\0")) {
        set(() => ({ isAiTyping: true }));
      }

      const chunk = rawChunk.replace(/\0/g, "");
      if (!chunk || !chunk.trim()) continue;

      fullText += chunk;

      if (rafId === null && typeof requestAnimationFrame !== "undefined") {
        rafId = requestAnimationFrame(() => {
          set(() => ({ isAiTyping: false, streamingContent: fullText }));
          rafId = null;
        });
      } else if (typeof requestAnimationFrame === "undefined") {
        set(() => ({ isAiTyping: false, streamingContent: fullText }));
      }
    }

    if (rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    set((s) => {
      const currentSession = s.sessionMessages[convId] || [];
      const targetId = replaceAssistantMessageId || assistantMessageId;
      const existingIdx = currentSession.findIndex((m) => m.id === targetId);

      let updatedSession: Message[];
      if (existingIdx !== -1) {
        updatedSession = currentSession.map((m, idx) => (idx === existingIdx ? { ...m, content: fullText } : m));
      } else {
        const assistantMsg = createMessage(convId, "assistant", fullText, { id: targetId });
        updatedSession = [...currentSession, assistantMsg];
      }

      return {
        sessionMessages: {
          ...s.sessionMessages,
          [convId]: updatedSession,
        },
        conversations: s.conversations.map((c) =>
          c.id === convId
            ? {
                ...c,
                messageCount: replaceAssistantMessageId ? c.messageCount : (c.messageCount || 0) + 1,
                lastMessageSnippet: fullText.slice(0, 90) + (fullText.length > 90 ? "..." : ""),
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
        streamingContent: null,
        regeneratingMessageId: null,
        isLoadingAi: false,
        isAiTyping: false,
      };
    });
  } catch (err: unknown) {
    console.error("Stream error:", err);
    if (rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    let errorDetail = "Failed to generate response";
    if (axios.isAxiosError(err)) {
      errorDetail = (err.response?.data as { error?: string })?.error || err.message || errorDetail;
    } else if (err instanceof Error) {
      errorDetail = err.message;
    }

    const targetId = replaceAssistantMessageId || assistantMessageId;
    const errorMsg = createMessage(convId, "assistant", `⚠️ **Request Notice**: ${errorDetail}`, {
      id: targetId,
    });

    set((s) => {
      const currentSession = s.sessionMessages[convId] || [];
      const existingIdx = currentSession.findIndex((m) => m.id === targetId);

      let updatedSession: Message[];
      if (existingIdx !== -1) {
        updatedSession = currentSession.map((m, idx) => (idx === existingIdx ? errorMsg : m));
      } else {
        updatedSession = [...currentSession, errorMsg];
      }

      return {
        sessionMessages: {
          ...s.sessionMessages,
          [convId]: updatedSession,
        },
        streamingContent: null,
        regeneratingMessageId: null,
        isLoadingAi: false,
        isAiTyping: false,
      };
    });
  }
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      sessionMessages: {},
      drafts: {},
      activeConversationId: null,
      isLoadingAi: false,
      isAiTyping: false,
      streamingContent: null,
      regeneratingMessageId: null,
      isLoadingConversations: false,
      error: null,

      setActiveConversation: (convId: string | null) => {
        if (get().activeConversationId === convId) return;
        set({ activeConversationId: convId, streamingContent: null });
      },

      setStreamToken: (convId: string, token: string) => {
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === convId ? { ...c, streamToken: token } : c)),
        }));
      },

      fetchConversations: async () => {
        set({ isLoadingConversations: true, error: null });
        try {
          const res = await api.get<Conversation[]>("/api/conversations");
          set({
            conversations: res.data,
            isLoadingConversations: false,
          });
        } catch (err: unknown) {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            set({ isLoadingConversations: false });
            return;
          }
          const message =
            axios.isAxiosError(err) && err.response?.data?.error
              ? err.response.data.error
              : err instanceof Error
                ? err.message
                : "Error fetching conversations";
          set({
            error: message,
            isLoadingConversations: false,
          });
        }
      },

      createConversation: async (documentId: string, initialTitle?: string): Promise<string> => {
        const state = get();
        const existingForDoc = state.conversations.filter((c) => c.documentIds.includes(documentId));
        const title = initialTitle || `Conversation ${existingForDoc.length + 1}`;

        const newConversation = createClientConversation(documentId, title);
        const newConvId = newConversation.id;

        set({
          conversations: [newConversation, ...state.conversations],
          sessionMessages: {
            ...state.sessionMessages,
            [newConvId]: [],
          },
          drafts: {
            ...state.drafts,
            [newConvId]: "",
          },
          activeConversationId: newConvId,
        });

        // Persist to the backend and store stream capability token
        try {
          const res = await api.post<Conversation & { streamToken?: string }>("/api/conversations", {
            id: newConvId,
            documentIds: [documentId],
            title,
          });
          const streamToken = res.data?.streamToken;
          if (streamToken) {
            set((s) => ({
              conversations: s.conversations.map((c) => (c.id === newConvId ? { ...c, streamToken } : c)),
            }));
          }
        } catch (err) {
          console.error("Failed to sync new conversation to server:", err);
        }

        return newConvId;
      },

      switchConversation: (targetConvId: string, currentDraft?: string) => {
        const state = get();
        const updatedDrafts = { ...state.drafts };

        if (state.activeConversationId && typeof currentDraft === "string") {
          updatedDrafts[state.activeConversationId] = currentDraft;
        }

        set({
          activeConversationId: targetConvId,
          drafts: updatedDrafts,
          streamingContent: null,
        });
      },

      saveDraft: (convId: string, draft: string) => {
        set((state) => ({
          drafts: {
            ...state.drafts,
            [convId]: draft,
          },
        }));
      },

      renameConversation: async (convId: string, newTitle: string) => {
        const trimmed = newTitle.trim();
        if (!trimmed) return;

        // Optimistic update
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId ? { ...c, title: trimmed, updatedAt: new Date().toISOString() } : c,
          ),
        }));

        try {
          await api.patch(`/api/conversations/${convId}`, { title: trimmed });
        } catch (err) {
          console.error("Failed to rename conversation:", err);
        }
      },

      deleteConversation: async (convId: string) => {
        const state = get();
        const remaining = state.conversations.filter((c) => c.id !== convId);
        const remainingSessionMessages = { ...state.sessionMessages };
        delete remainingSessionMessages[convId];
        const remainingDrafts = { ...state.drafts };
        delete remainingDrafts[convId];

        let newActiveId = state.activeConversationId;
        if (state.activeConversationId === convId) {
          newActiveId = null;
        }

        set({
          conversations: remaining,
          sessionMessages: remainingSessionMessages,
          drafts: remainingDrafts,
          activeConversationId: newActiveId,
        });

        if (activePollTimers.has(convId)) {
          clearInterval(activePollTimers.get(convId)!);
          activePollTimers.delete(convId);
        }

        try {
          await api.delete(`/api/conversations/${convId}`);
        } catch (err) {
          console.error("Failed to delete conversation on server:", err);
        }
      },

      clearSessionMessages: (convId: string) => {
        set((state) => ({
          sessionMessages: {
            ...state.sessionMessages,
            [convId]: [],
          },
          conversations: state.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messageCount: 0,
                  lastMessageSnippet: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : c,
          ),
        }));
      },

      syncConversationTitle: async (convId: string) => {
        try {
          const res = await api.get<{ title?: string }>(`/api/conversations/${convId}/title`);
          const newTitle = res.data?.title;
          if (newTitle) {
            set((state) => ({
              conversations: state.conversations.map((c) => (c.id === convId ? { ...c, title: newTitle } : c)),
            }));
          }
        } catch (err) {
          console.warn("Failed to sync conversation title:", err);
        }
      },

      pollConversationTitle: (convId: string, initialTitle: string) => {
        const existingTimer = activePollTimers.get(convId);
        if (existingTimer) {
          clearInterval(existingTimer);
          activePollTimers.delete(convId);
        }

        let attempts = 0;
        const maxAttempts = 10;
        const pollIntervalMs = 1500;

        const timer = setInterval(async () => {
          attempts += 1;

          const currentConv = get().conversations.find((c) => c.id === convId);
          if (!currentConv || attempts > maxAttempts) {
            clearInterval(timer);
            activePollTimers.delete(convId);
            return;
          }

          try {
            const res = await api.get<{ title?: string }>(`/api/conversations/${convId}/title`);
            const serverTitle = res.data?.title?.trim();

            if (serverTitle && serverTitle !== initialTitle && !isDefaultTitle(serverTitle)) {
              set((state) => ({
                conversations: state.conversations.map((c) => (c.id === convId ? { ...c, title: serverTitle } : c)),
              }));

              clearInterval(timer);
              activePollTimers.delete(convId);
            }
          } catch (err) {
            console.warn("Failed to poll conversation title:", err);
          }
        }, pollIntervalMs);

        activePollTimers.set(convId, timer);
      },

      sendMessage: async (
        convId: string,
        content: string,
        options?: { priorMessages?: Message[]; activeDoc?: Document } | Document,
      ) => {
        const state = get();
        const now = new Date().toISOString();

        let priorMessages: Message[] | undefined;

        if (options) {
          if ("priorMessages" in options) {
            priorMessages = options.priorMessages;
          }
        }

        const userMsg = createMessage(convId, "user", content, { createdAt: now });

        const existingSession = state.sessionMessages[convId] || [];
        const updatedSession = [...existingSession, userMsg];

        const updatedDrafts = { ...state.drafts, [convId]: "" };

        // Save user message immediately & set loading state
        set({
          sessionMessages: {
            ...state.sessionMessages,
            [convId]: updatedSession,
          },
          conversations: state.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messageCount: (c.messageCount || 0) + 1,
                  lastMessageSnippet: content,
                  updatedAt: now,
                }
              : c,
          ),
          drafts: updatedDrafts,
          isLoadingAi: true,
          streamingContent: null,
          regeneratingMessageId: null,
        });

        // Pre-create assistant message reference
        const placeholderAiMsg = createMessage(convId, "assistant");
        const assistantMessageId = placeholderAiMsg.id;

        // Prepare prior conversation history for multi-turn context (last 10 turns)
        const allPrior = priorMessages ?? existingSession;
        const conversationHistory = allPrior
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-10)
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        await executeChatStream({
          convId,
          assistantMessageId,
          content,
          conversationHistory,
          set,
          get,
        });
      },

      editMessage: async (convId: string, messageId: string, newContent: string) => {
        set((state) => {
          const currentSession = state.sessionMessages[convId];
          if (!currentSession) return {};
          return {
            sessionMessages: {
              ...state.sessionMessages,
              [convId]: currentSession.map((m) => (m.id === messageId ? { ...m, content: newContent } : m)),
            },
          };
        });

        await api.patch(`/api/conversations/${convId}/messages/${messageId}`, {
          content: newContent,
        });
      },

      regenerateMessage: async (
        convId: string,
        assistantMessageId: string,
        options: {
          promptContent: string;
          conversationHistory?: { role: "user" | "assistant"; content: string }[];
        },
      ) => {
        set({
          isLoadingAi: true,
          regeneratingMessageId: assistantMessageId,
          streamingContent: null,
        });

        const history = options.conversationHistory?.slice(-10) || [];
        await executeChatStream({
          convId,
          assistantMessageId,
          content: options.promptContent,
          conversationHistory: history,
          skipUserPersistence: true,
          replaceAssistantMessageId: assistantMessageId,
          set,
          get,
        });
      },

      deleteMessage: async (convId: string, messageId: string) => {
        set((state) => {
          const currentSession = state.sessionMessages[convId];
          if (!currentSession) return {};
          return {
            sessionMessages: {
              ...state.sessionMessages,
              [convId]: currentSession.filter((m) => m.id !== messageId),
            },
          };
        });

        await api.delete(`/api/conversations/${convId}/messages/${messageId}`);
      },

      resetToDefaults: () => {
        activePollTimers.forEach((timer) => clearInterval(timer));
        activePollTimers.clear();
        set({
          conversations: [],
          sessionMessages: {},
          drafts: {},
          activeConversationId: null,
          isLoadingAi: false,
          isAiTyping: false,
          streamingContent: null,
          regeneratingMessageId: null,
          error: null,
        });
      },
    }),
    {
      name: "docsy-conversations-v3",
      partialize: (state) => ({
        drafts: state.drafts,
        activeConversationId: state.activeConversationId,
      }),
    },
  ),
);

// Register token handlers so Axios interceptor seamlessly coordinates with Zustand state
registerTokenHandlers({
  getToken: (convId) => useConversationStore.getState().conversations.find((c) => c.id === convId)?.streamToken,
  setToken: (convId, token) => {
    useConversationStore.getState().setStreamToken(convId, token);
  },
});
