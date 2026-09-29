import { Conversation, Message } from "@/types";

/**
 * Factory function to create standardized client-side message records.
 */
export function createMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content = "",
  options?: { id?: string; createdAt?: string }
): Message {
  const generatedId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `msg-${role}-${Date.now()}`;

  return {
    id: options?.id || generatedId,
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
  }
): Conversation {
  const id =
    options?.id ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `conv-${Date.now()}`);
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
