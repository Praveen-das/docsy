import { api } from "@/lib/api-client";
import { Conversation } from "@/types";

export interface ConversationListParams {
  documentId?: string;
  search?: string;
  pinned?: true;
  sort?: "newest" | "oldest" | "title";
  limit?: number;
  offset?: number;
}

/**
 * Service providing typed HTTP endpoints for conversation and message persistence.
 */
export const conversationService = {
  /**
   * Fetches one conversation (with fresh stream token).
   */
  async fetchConversation(convId: string): Promise<Pick<Conversation, "id" | "title" | "documentIds" | "streamToken" | "updatedAt">> {
    const res = await api.get(`/api/conversations/${encodeURIComponent(convId)}`);
    return res.data;
  },

  /**
   * Fetches total and per-document conversation counts.
   */
  async fetchCounts(): Promise<{ total: number; byDocument: Record<string, number> }> {
    const res = await api.get<{ total: number; byDocument: Record<string, number> }>("/api/conversations/counts");
    return res.data;
  },

  /**
   * Fetches conversations and pinned IDs. Without `limit` returns all; with `limit` returns a page
   * plus `nextOffset`. `documentId` filters server-side.
   */
  async fetchConversations(
    params: ConversationListParams = {},
  ): Promise<{ conversations: Conversation[]; pinnedIds: string[]; nextOffset: number | null }> {
    const res = await api.get<{ conversations: Conversation[]; pinnedIds: string[]; nextOffset: number | null }>(
      "/api/conversations",
      { params },
    );
    return res.data;
  },

  /**
   * Persists a newly created conversation to the server and retrieves stream capability token.
   */
  async createConversation(
    id: string,
    documentIds: string[],
    title: string,
  ): Promise<Conversation & { streamToken?: string }> {
    const res = await api.post<Conversation & { streamToken?: string }>("/api/conversations", {
      id,
      documentIds,
      title,
    });
    return res.data;
  },

  /**
   * Renames an existing conversation.
   */
  async renameConversation(convId: string, title: string): Promise<void> {
    await api.patch(`/api/conversations/${convId}`, { title });
  },

  /**
   * Deletes a conversation on the server.
   */
  async deleteConversation(convId: string): Promise<void> {
    await api.delete(`/api/conversations/${convId}`);
  },

  /**
   * Deletes all conversations for the authenticated user on the server.
   */
  async deleteAllConversations(): Promise<number> {
    const res = await api.delete<{ success: boolean; count: number }>("/api/conversations");
    return res.data?.count ?? 0;
  },

  /**
   * Fetches the current title of a conversation.
   */
  async fetchConversationTitle(convId: string): Promise<string | undefined> {
    const res = await api.get<{ title?: string }>(`/api/conversations/${convId}/title`);
    return res.data?.title;
  },

  /**
   * Generates or regenerates an AI title for the conversation.
   */
  async generateConversationTitle(
    convId: string,
    userMessage?: string,
    assistantMessage?: string,
  ): Promise<string | undefined> {
    const res = await api.post<{ title?: string }>(`/api/conversations/${convId}/title`, {
      userMessage,
      assistantMessage,
      force: true,
    });
    return res.data?.title;
  },

  /**
   * Updates an existing message content.
   */
  async editMessage(convId: string, messageId: string, content: string): Promise<void> {
    await api.patch(`/api/conversations/${convId}/messages/${messageId}`, {
      content,
    });
  },

  /**
   * Deletes a specific message.
   */
  async deleteMessage(convId: string, messageId: string): Promise<void> {
    await api.delete(`/api/conversations/${convId}/messages/${messageId}`);
  },

  /**
   * Toggles pin status for a conversation.
   */
  async togglePinConversation(convId: string): Promise<{ isPinned: boolean }> {
    const res = await api.post<{ isPinned: boolean }>(`/api/conversations/${convId}/pin`);
    return res.data;
  },
};
