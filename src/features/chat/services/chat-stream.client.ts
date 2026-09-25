import axios from "axios";
import { api } from "@/lib/api-client";

export interface StreamChatParams {
  convId: string;
  assistantMessageId: string;
  content: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  conversationToken?: string;
  skipUserPersistence?: boolean;
  replaceAssistantMessageId?: string;
  customPrompt?: string;
  onTyping: () => void;
  onChunk: (accumulatedText: string) => void;
  onComplete: (fullText: string) => void;
  onError: (errorDetail: string) => void;
}

/**
 * Extracts a human-friendly error message from server or network errors.
 */
export function extractStreamErrorMessage(err: unknown): string {
  let errorDetail = "Failed to generate response";
  if (axios.isAxiosError(err)) {
    errorDetail =
      (err.response?.data as { error?: string })?.error || err.message || errorDetail;
  } else if (err instanceof Error) {
    errorDetail = err.message;
  }
  return errorDetail;
}

/**
 * Executes a durable chat stream via SSE and triggers the background workflow in parallel.
 * Batches incoming tokens using requestAnimationFrame to prevent render thrashing.
 */
export async function streamChatResponse({
  convId,
  assistantMessageId,
  content,
  conversationHistory,
  conversationToken,
  skipUserPersistence,
  replaceAssistantMessageId,
  customPrompt,
  onTyping,
  onChunk,
  onComplete,
  onError,
}: StreamChatParams): Promise<void> {
  let rafId: number | null = null;

  try {
    // Unique ephemeral channel ID prevents replaying chunks from prior generations
    const streamChannelId = replaceAssistantMessageId
      ? `regen-${assistantMessageId}-${Date.now()}`
      : assistantMessageId;

    const [res] = await Promise.all([
      api.get<ReadableStream<Uint8Array>>(
        `/api/conversations/${convId}/messages/stream?id=${streamChannelId}`,
        {
          responseType: "stream",
          adapter: "fetch",
        }
      ),
      api.post(`/api/conversations/${convId}/messages/stream`, {
        messageId: assistantMessageId,
        streamChannelId,
        conversationId: convId,
        content,
        conversationHistory,
        conversationToken,
        skipUserPersistence,
        replaceAssistantMessageId,
        customPrompt,
      }),
    ]);

    const stream = res.data;
    const reader =
      stream?.getReader?.() ||
      (stream as unknown as { body?: ReadableStream<Uint8Array> })?.body?.getReader?.();

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
        onTyping();
      }

      const chunk = rawChunk.replace(/\0/g, "");
      if (!chunk || !chunk.trim()) continue;

      fullText += chunk;

      if (rafId === null && typeof requestAnimationFrame !== "undefined") {
        rafId = requestAnimationFrame(() => {
          onChunk(fullText);
          rafId = null;
        });
      } else if (typeof requestAnimationFrame === "undefined") {
        onChunk(fullText);
      }
    }

    if (rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    onComplete(fullText);
  } catch (err: unknown) {
    console.error("Stream error in chat client:", err);
    if (rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    onError(extractStreamErrorMessage(err));
  }
}
