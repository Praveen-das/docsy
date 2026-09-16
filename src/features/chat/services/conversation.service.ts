import { api } from "@/lib/api-client";
import { Conversation } from "@/types";

/**
 * Service providing typed HTTP endpoints for conversation and message persistence.
 */
export const conversationService = {
  /**
   * Fetches all conversations for the authenticated user.
   */
  async fetchConversations(): Promise<Conversation[]> {
    const res = await api.get<Conversation[]>("/api/conversations");
    return res.data;
  },

  /**
   * Persists a newly created conversation to the server and retrieves stream capability token.
   */
  async createConversation(
    id: string,
    documentIds: string[],
    title: string
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
    assistantMessage?: string
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
};
