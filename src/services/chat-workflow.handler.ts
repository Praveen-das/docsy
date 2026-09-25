import { serve } from "@upstash/workflow/nextjs";
import { WorkflowAbort } from "@upstash/workflow";
import { streamText } from "ai";

import { realtime } from "@/lib/realtime";
import { getChatModel } from "@/lib/ai";
import { dispatchChatPipeline } from "@/services/chat.service";
import { persistMessage, updateMessage } from "@/services/conversation.service";
import { updateConversationTitleIfDefault } from "@/services/title.service";
import { logger } from "@/lib/logger";
import type { ChatWorkflowPayload } from "@/types/chat.types";

/**
 * Upstash Workflow definition executing durable AI chat steps.
 * Receives pre-verified payload from the POST route entrypoint.
 *
 * Step 1 — "ai-generation": Streams LLM deltas to Upstash Realtime, then
 *          persists or updates the assistant message.
 * Step 2 — "title-generation": Generates a conversation title on initial exchange.
 */
const { POST: workflowHandler } = serve<ChatWorkflowPayload>(async (context) => {
  const {
    conversationId,
    messageId,
    streamChannelId,
    userId,
    documentIds,
    content,
    conversationHistory = [],
    skipUserPersistence = false,
    replaceAssistantMessageId,
    customPrompt,
  } = context.requestPayload;

  if (!conversationId || !messageId || !userId || !content) {
    logger.error("chat.workflow_invalid_payload", {
      conversationId,
      messageId,
      hasUserId: Boolean(userId),
      hasContent: Boolean(content),
    });
    throw new WorkflowAbort("Invalid workflow request payload: missing required fields");
  }

  // Use the ephemeral streamChannelId for realtime so regeneration doesn't
  // replay old chunks from channel.history(). Falls back to messageId for
  // backwards compatibility with first-time message generation.
  const channelId = streamChannelId || messageId;

  logger.info("chat.workflow_started", {
    userId,
    conversationId,
    messageId,
    channelId,
    skipUserPersistence,
    replaceAssistantMessageId,
  });

  // 1. Durable AI Generation Step
  const generationResult = await context.run("ai-generation", async () => {
    const channel = realtime.channel(channelId);

    try {
      await channel.emit("ai.chunk", { type: "typing" });

      const { ragResult, persistUserPromise } = await dispatchChatPipeline({
        userId,
        conversationId,
        content,
        documentIds,
        conversationHistory,
        skipUserPersistence,
        customPrompt,
      });

      const result = streamText({
        model: getChatModel(),
        system: ragResult.systemPrompt,
        messages: ragResult.promptMessages,
      });

      let fullText = "";

      for await (const chunk of result.textStream) {
        fullText += chunk;
        await channel.emit("ai.chunk", { type: "text-delta", text: chunk });
      }

      await channel.emit("ai.chunk", { type: "finish" });

      // Persist or in-place update assistant message in database
      await persistUserPromise;
      if (replaceAssistantMessageId) {
        await updateMessage(userId, conversationId, replaceAssistantMessageId, fullText);
      } else {
        await persistMessage({ conversationId, role: "assistant", content: fullText });
      }

      logger.info("chat.completed", {
        userId,
        conversationId,
        messageId,
        responseLength: fullText.length,
      });

      return { success: true, fullText };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await channel.emit("ai.chunk", { type: "error", error: errorMessage });
      logger.error("chat.workflow_ai_generation_failed", {
        userId,
        conversationId,
        messageId,
        error: errorMessage,
      });
      throw err;
    }
  });

  // 2. Durable Title Generation Step (first exchange only)
  const isInitialExchange = conversationHistory.length === 0;
  if (isInitialExchange) {
    await context.run("title-generation", async () => {
      try {
        const generatedTitle = await updateConversationTitleIfDefault({
          conversationId,
          userId,
          userMessage: content,
          assistantMessage: generationResult.fullText,
        });

        if (generatedTitle) {
          const convChannel = realtime.channel(conversationId);
          await convChannel.emit("ai.chunk", { type: "title", title: generatedTitle });
        }

        return { success: true, title: generatedTitle };
      } catch (err) {
        logger.warn("chat.workflow_title_generation_failed", {
          conversationId,
          error: err instanceof Error ? err.message : String(err),
        });
        return { success: false };
      }
    });
  }
});

export { workflowHandler };
