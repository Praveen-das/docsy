import { QueryClient } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { getCachedMessages } from "../services/message-cache.service";
import { Message } from "@/types";

/**
 * Extracts plain text from AI SDK UIMessage parts or fallback content.
 */
function getUIMessageText(msg: UIMessage): string {
  if (msg.parts && Array.isArray(msg.parts)) {
    const text = msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
    if (text) return text;
  }
  return typeof (msg as any).content === "string" ? (msg as any).content : "";
}

/**
 * Converts AI SDK UIMessage to canonical internal Message model.
 */
function uiMessageToMessage(msg: UIMessage | Message): Message {
  if ("conversationId" in msg && typeof msg.content === "string") {
    return msg as Message;
  }
  return {
    id: msg.id,
    conversationId: "",
    role: msg.role === "user" ? "user" : "assistant",
    content: getUIMessageText(msg as UIMessage),
    createdAt:
      (msg as any).createdAt instanceof Date
        ? (msg as any).createdAt.toISOString()
        : typeof (msg as any).createdAt === "string"
          ? (msg as any).createdAt
          : new Date().toISOString(),
  };
}

/**
 * Retrieves all messages for a conversation from cached React Query server history.
 */
export function getAllConversationMessages(queryClient: QueryClient, conversationId: string): Message[] {
  if (!conversationId) return [];
  return getCachedMessages(queryClient, conversationId);
}

/**
 * Extracts chronological user/assistant conversation history tuples for model context.
 */
export function extractConversationTurns(
  messages: Message[],
  uptoIndex?: number,
  maxTurns = 10,
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

/**
 * Traverses backwards from assistant message index to locate the preceding user prompt and prior history.
 */
export function findPrecedingUserTurn(
  messages: Message[],
  assistantIdx: number,
): { promptContent: string; priorTurns: Message[] } | null {
  for (let i = assistantIdx - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      return {
        promptContent: messages[i].content,
        priorTurns: messages.slice(0, i),
      };
    }
  }
  return null;
}
