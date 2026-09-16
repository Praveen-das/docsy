import { QueryClient } from "@tanstack/react-query";
import { Message } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { getCachedMessages } from "../hooks/use-conversation-messages";

/**
 * Retrieves all messages for a conversation combining cached React Query server history
 * and active in-memory Zustand session turns.
 */
export function getAllConversationMessages(
  queryClient: QueryClient,
  conversationId: string
): Message[] {
  if (!conversationId) return [];
  const cached = getCachedMessages(queryClient, conversationId);
  const session = useConversationStore.getState().sessionMessages[conversationId] || [];
  return [...cached, ...session];
}

/**
 * Extracts chronological user/assistant conversation history tuples for model context.
 */
export function extractConversationTurns(
  messages: Message[],
  uptoIndex?: number,
  maxTurns = 10
): { role: "user" | "assistant"; content: string }[] {
  const sliceTarget = typeof uptoIndex === "number" ? messages.slice(0, uptoIndex) : messages;
  return sliceTarget
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-maxTurns)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}

/**
 * Shares a chat message using the Web Share API with clipboard fallback.
 */
export async function shareMessageContent(message: Message): Promise<boolean> {
  const isAssistant = message.role === "assistant";
  const headerTitle = isAssistant ? "Docsy Assistant" : "User Prompt";
  const snippet = `### ${headerTitle}\n\n${message.content}`;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: `${headerTitle} - Docsy`,
        text: snippet,
        url: typeof window !== "undefined" ? window.location.href : undefined,
      });
      return true;
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return false;
      }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(snippet);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
