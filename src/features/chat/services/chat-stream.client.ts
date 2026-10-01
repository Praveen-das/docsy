import axios from "axios";
import { api } from "@/lib/api-client";

export interface StreamChatParams {
  convId: string;
  assistantMessageId: string;
  streamChannelId?: string;
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

export interface ResumeChatStreamParams {
  convId: string;
  streamChannelId: string;
  onTyping: () => void;
  onChunk: (accumulatedText: string) => void;
  onComplete: (fullText: string) => void;
  onError: (errorDetail: string) => void;
}

/**
 * Extracts a human-friendly error message from server or network errors.
 */
function extractStreamErrorMessage(err: unknown): string {
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
 * Reads chunks from a ReadableStream, batches DOM updates with RAF, and handles typing indicators.
 */
async function consumeStreamReader(
  streamData: unknown,
  onTyping: () => void,
  onChunk: (accumulatedText: string) => void
): Promise<string> {
  const reader =
    (streamData as ReadableStream<Uint8Array>)?.getReader?.() ||
    (streamData as { body?: ReadableStream<Uint8Array> })?.body?.getReader?.();

  if (!reader) {
    throw new Error("No readable stream response from server");
  }

  let rafId: number | null = null;
  const decoder = new TextDecoder();
  let fullText = "";

  try {
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
  } finally {
    if (rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  return fullText;
}

/**
 * Executes a durable chat stream via SSE and triggers the background workflow in parallel.
 */
export async function streamChatResponse({
  convId,
  assistantMessageId,
  streamChannelId: customChannelId,
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
  try {
    // Unique ephemeral channel ID prevents replaying chunks from prior generations
    const streamChannelId =
      customChannelId ||
      (replaceAssistantMessageId
        ? `regen-${assistantMessageId}-${Date.now()}`
        : assistantMessageId);

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

    const fullText = await consumeStreamReader(res.data, onTyping, onChunk);
    onComplete(fullText);
  } catch (err: unknown) {
    console.error("Stream error in chat client:", err);
    onError(extractStreamErrorMessage(err));
  }
}

/**
 * Resumes an existing durable chat stream without re-triggering the background workflow.
 */
export async function resumeChatStream({
  convId,
  streamChannelId,
  onTyping,
  onChunk,
  onComplete,
  onError,
}: ResumeChatStreamParams): Promise<void> {
  try {
    const res = await api.get<ReadableStream<Uint8Array>>(
      `/api/conversations/${convId}/messages/stream?id=${streamChannelId}`,
      {
        responseType: "stream",
        adapter: "fetch",
      }
    );

    const fullText = await consumeStreamReader(res.data, onTyping, onChunk);
    onComplete(fullText);
  } catch (err: unknown) {
    console.error("Resume stream error in chat client:", err);
    onError(extractStreamErrorMessage(err));
  }
}
