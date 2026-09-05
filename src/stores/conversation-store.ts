"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Conversation, Message, Document, Citation } from "@/types";

interface ConversationState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  drafts: Record<string, string>;
  activeConversationId: string | null;
  activeDocumentId: string | null;
  isLoadingAi: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  error: string | null;

  // Actions
  setActiveDocument: (docId: string | null) => void;
  setActiveConversation: (convId: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (convId: string) => Promise<void>;
  createConversation: (documentId: string, initialTitle?: string) => string;
  switchConversation: (targetConvId: string, currentDraft?: string) => void;
  saveDraft: (convId: string, draft: string) => void;
  renameConversation: (convId: string, newTitle: string) => Promise<void>;
  deleteConversation: (convId: string) => Promise<void>;
  clearMessages: (convId: string) => void;
  sendMessage: (
    convId: string,
    content: string,
    activeDoc?: Document
  ) => Promise<void>;
  resetToDefaults: () => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      drafts: {},
      activeConversationId: null,
      activeDocumentId: null,
      isLoadingAi: false,
      isLoadingConversations: false,
      isLoadingMessages: false,
      error: null,

      setActiveDocument: (docId: string | null) => {
        set({ activeDocumentId: docId });
      },

      setActiveConversation: (convId: string | null) => {
        const { conversations } = get();
        if (convId) {
          const conv = conversations.find((c) => c.id === convId);
          if (conv && conv.documentIds.length > 0) {
            set({
              activeConversationId: convId,
              activeDocumentId: conv.documentIds[0],
            });
            // Fetch messages for this conversation if not yet loaded
            get().fetchMessages(convId);
            return;
          }
        }
        set({ activeConversationId: convId });
        if (convId) {
          get().fetchMessages(convId);
        }
      },

      fetchConversations: async () => {
        set({ isLoadingConversations: true, error: null });
        try {
          const res = await fetch("/api/conversations");
          if (!res.ok) {
            if (res.status === 401) {
              set({ isLoadingConversations: false });
              return;
            }
            throw new Error(`Failed to load conversations (${res.status})`);
          }
          const data: Conversation[] = await res.json();
          set({
            conversations: data,
            isLoadingConversations: false,
          });

          // If no active conversation set, pick the first one
          const currentActive = get().activeConversationId;
          if (!currentActive && data.length > 0) {
            set({
              activeConversationId: data[0].id,
              activeDocumentId: data[0].documentIds[0] || null,
            });
            get().fetchMessages(data[0].id);
          }
        } catch (err) {
          set({
            error:
              err instanceof Error ? err.message : "Error fetching conversations",
            isLoadingConversations: false,
          });
        }
      },

      fetchMessages: async (convId: string) => {
        if (!convId) return;
        set({ isLoadingMessages: true });
        try {
          const res = await fetch(`/api/conversations/${convId}/messages`);
          if (!res.ok) {
            set({ isLoadingMessages: false });
            return;
          }
          const msgs: Message[] = await res.json();
          set((state) => ({
            messages: {
              ...state.messages,
              [convId]: msgs,
            },
            isLoadingMessages: false,
          }));
        } catch {
          set({ isLoadingMessages: false });
        }
      },

      createConversation: (documentId: string, initialTitle?: string): string => {
        const state = get();
        const existingForDoc = state.conversations.filter((c) =>
          c.documentIds.includes(documentId)
        );
        const title =
          initialTitle ||
          `Conversation ${existingForDoc.length + 1}`;

        // Generate client-side UUID for immediate routing and optimistic UI
        const newConvId =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `conv-${Date.now()}`;

        const now = new Date().toISOString();
        const newConversation: Conversation = {
          id: newConvId,
          userId: "current-user",
          title,
          documentIds: [documentId],
          lastMessageSnippet: undefined,
          messageCount: 0,
          createdAt: now,
          updatedAt: now,
        };

        set({
          conversations: [newConversation, ...state.conversations],
          messages: {
            ...state.messages,
            [newConvId]: [],
          },
          drafts: {
            ...state.drafts,
            [newConvId]: "",
          },
          activeConversationId: newConvId,
          activeDocumentId: documentId,
        });

        // Asynchronously persist to the backend
        fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newConvId,
            documentIds: [documentId],
            title,
          }),
        }).catch((err) => {
          console.error("Failed to sync new conversation to server:", err);
        });

        return newConvId;
      },

      switchConversation: (targetConvId: string, currentDraft?: string) => {
        const state = get();
        const updatedDrafts = { ...state.drafts };

        if (state.activeConversationId && typeof currentDraft === "string") {
          updatedDrafts[state.activeConversationId] = currentDraft;
        }

        const targetConv = state.conversations.find((c) => c.id === targetConvId);
        const targetDocId =
          targetConv?.documentIds[0] || state.activeDocumentId;

        set({
          activeConversationId: targetConvId,
          activeDocumentId: targetDocId,
          drafts: updatedDrafts,
        });

        // Ensure messages are loaded
        if (!state.messages[targetConvId]) {
          get().fetchMessages(targetConvId);
        }
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
            c.id === convId
              ? { ...c, title: trimmed, updatedAt: new Date().toISOString() }
              : c
          ),
        }));

        try {
          await fetch(`/api/conversations/${convId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: trimmed }),
          });
        } catch (err) {
          console.error("Failed to rename conversation:", err);
        }
      },

      deleteConversation: async (convId: string) => {
        const state = get();
        const remaining = state.conversations.filter((c) => c.id !== convId);
        const remainingMessages = { ...state.messages };
        delete remainingMessages[convId];
        const remainingDrafts = { ...state.drafts };
        delete remainingDrafts[convId];

        let newActiveId = state.activeConversationId;
        if (state.activeConversationId === convId) {
          const docId = state.activeDocumentId;
          const sibling = docId
            ? remaining.find((c) => c.documentIds.includes(docId))
            : remaining[0];
          newActiveId = sibling ? sibling.id : null;
        }

        set({
          conversations: remaining,
          messages: remainingMessages,
          drafts: remainingDrafts,
          activeConversationId: newActiveId,
        });

        try {
          await fetch(`/api/conversations/${convId}`, { method: "DELETE" });
        } catch (err) {
          console.error("Failed to delete conversation on server:", err);
        }
      },

      clearMessages: (convId: string) => {
        set((state) => ({
          messages: {
            ...state.messages,
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
              : c
          ),
        }));
      },

      sendMessage: async (
        convId: string,
        content: string,
        _activeDoc?: Document
      ) => {
        const state = get();
        const now = new Date().toISOString();

        const userMsg: Message = {
          id: `msg-user-${Date.now()}`,
          conversationId: convId,
          role: "user",
          content,
          createdAt: now,
        };

        const existingMessages = state.messages[convId] || [];
        const updatedMessages = [...existingMessages, userMsg];

        // Intelligent auto-naming from first user query
        const currentConv = state.conversations.find((c) => c.id === convId);
        let updatedTitle = currentConv?.title || "Conversation";
        if (
          !currentConv ||
          currentConv.title.startsWith("New Conversation") ||
          currentConv.title.startsWith("Conversation ")
        ) {
          const cleanSnippet = content.replace(/[?.,!]/g, "").trim();
          updatedTitle =
            cleanSnippet.length > 36
              ? `${cleanSnippet.slice(0, 36)}...`
              : cleanSnippet;
        }

        const updatedDrafts = { ...state.drafts, [convId]: "" };

        // Save user message immediately & set loading state
        set({
          messages: {
            ...state.messages,
            [convId]: updatedMessages,
          },
          conversations: state.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  title: updatedTitle,
                  messageCount: updatedMessages.length,
                  lastMessageSnippet: content,
                  updatedAt: now,
                }
              : c
          ),
          drafts: updatedDrafts,
          isLoadingAi: true,
        });

        // Placeholder for streaming assistant message
        const assistantMessageId = `msg-ai-${Date.now()}`;
        const placeholderAiMsg: Message = {
          id: assistantMessageId,
          conversationId: convId,
          role: "assistant",
          content: "",
          sources: [],
          createdAt: new Date().toISOString(),
        };

        set((s) => ({
          messages: {
            ...s.messages,
            [convId]: [...s.messages[convId], placeholderAiMsg],
          },
        }));

        try {
          const res = await fetch(
            `/api/conversations/${convId}/messages/stream`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content }),
            }
          );

          if (!res.ok) {
            let errorDetail = "Failed to generate response";
            try {
              const errJson = await res.json();
              if (errJson.error) errorDetail = errJson.error;
            } catch {
              // Ignore non-json responses
            }

            set((s) => ({
              messages: {
                ...s.messages,
                [convId]: s.messages[convId].map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: `⚠️ **Request Notice**: ${errorDetail}`,
                      }
                    : m
                ),
              },
              isLoadingAi: false,
            }));
            return;
          }

          // Extract citation sources from header
          const sourcesHeader = res.headers.get("x-sources");
          let citations: Citation[] = [];
          if (sourcesHeader) {
            try {
              citations = JSON.parse(decodeURIComponent(sourcesHeader));
            } catch {
              // Ignore parsing error
            }
          }

          // Read stream chunks
          const reader = res.body?.getReader();
          if (!reader) {
            throw new Error("No readable stream response from server");
          }

          const decoder = new TextDecoder();
          let fullText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;

            set((s) => ({
              messages: {
                ...s.messages,
                [convId]: s.messages[convId].map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: fullText,
                        sources:
                          citations.length > 0 ? citations : m.sources,
                      }
                    : m
                ),
              },
            }));
          }

          // Final update on completion
          set((s) => ({
            conversations: s.conversations.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messageCount: (s.messages[convId] || []).length,
                    lastMessageSnippet:
                      fullText.slice(0, 90) + (fullText.length > 90 ? "..." : ""),
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
            isLoadingAi: false,
          }));
        } catch (err) {
          console.error("Stream error:", err);
          set((s) => ({
            messages: {
              ...s.messages,
              [convId]: s.messages[convId].map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content:
                        m.content.length > 0
                          ? m.content
                          : "⚠️ Connection interrupted. Please try asking again.",
                    }
                  : m
              ),
            },
            isLoadingAi: false,
          }));
        }
      },

      resetToDefaults: () => {
        set({
          conversations: [],
          messages: {},
          drafts: {},
          activeConversationId: null,
          activeDocumentId: null,
          isLoadingAi: false,
          error: null,
        });
      },
    }),
    {
      name: "docsy-conversations-v3",
      partialize: (state) => ({
        drafts: state.drafts,
        activeConversationId: state.activeConversationId,
        activeDocumentId: state.activeDocumentId,
      }),
    }
  )
);
