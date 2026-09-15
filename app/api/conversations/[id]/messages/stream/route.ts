import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { serve } from "@upstash/workflow/nextjs";
import { WorkflowAbort } from "@upstash/workflow";
import { streamText } from "ai";

import { realtime } from "@/lib/realtime";
import { getChatModel } from "@/lib/ai";
import { getWorkflowClient } from "@/lib/workflow";
import { verifyChatPreflight, dispatchChatPipeline } from "@/services/chat.service";
import { persistMessage, updateMessage } from "@/services/conversation.service";
import { updateConversationTitleIfDefault } from "@/services/title.service";
import { chatStreamSchema } from "@/lib/validations/chat.schema";
import { logger } from "@/lib/logger";
import type { HistoryMessage } from "@/lib/validations/chat.schema";

export interface ChatWorkflowPayload {
  messageId: string;
  streamChannelId?: string;
  conversationId: string;
  userId: string;
  documentIds: string[];
  content: string;
  conversationHistory?: HistoryMessage[];
  skipUserPersistence?: boolean;
  replaceAssistantMessageId?: string;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/conversations/:id/messages/stream?id=<messageId>
 *
 * Resumable, durable stream reader connecting to Upstash Realtime channel.
 * Uses channel.history().on(...) to replay buffered tokens and yield live deltas,
 * ensuring zero dropped tokens on reconnects or network interruptions.
 */
export const GET = async (req: Request) => {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Message ID is required", { status: 400 });
  }

  const channel = realtime.channel(id);
  const isSSE = req.headers.get("accept")?.includes("text/event-stream");

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const safeClose = () => {
        if (!isClosed) {
          isClosed = true;
          try {
            controller.close();
          } catch {
            // Controller may already be closed
          }
        }
      };

      const safeEnqueue = (data: Uint8Array | string) => {
        if (!isClosed) {
          try {
            controller.enqueue(data);
          } catch {
            // Controller may already be closed
          }
        }
      };

      const safeError = (err: unknown) => {
        if (!isClosed) {
          isClosed = true;
          try {
            controller.error(err);
          } catch {
            // Controller may already be closed
          }
        }
      };

      const encoder = new TextEncoder();

      // Heartbeat: send a space byte every 15s to prevent undici body timeout
      // during the idle gap between stream open and first AI token
      const heartbeat = setInterval(() => {
        if (isClosed) {
          clearInterval(heartbeat);
          return;
        }
        if (isSSE) {
          safeEnqueue(": keepalive\n\n");
        } else {
          safeEnqueue(encoder.encode(" "));
        }
      }, 15_000);

      try {
        await channel.history().on("ai.chunk", (chunk: any) => {
          if (isSSE) {
            safeEnqueue(`data: ${JSON.stringify(chunk)}\n\n`);
            if (chunk.type === "finish" || chunk.type === "error") {
              clearInterval(heartbeat);
              safeClose();
            }
            return;
          }

          if (chunk.type === "typing") {
            // Null byte as a control marker for typing signal
            safeEnqueue(encoder.encode("\0"));
          } else if (chunk.type === "text-delta" && typeof chunk.text === "string") {
            console.log("aaaaaaaaaaaa: ", chunk.text);
            safeEnqueue(encoder.encode(chunk.text));
          } else if (chunk.type === "finish") {
            clearInterval(heartbeat);
            safeClose();
          } else if (chunk.type === "error") {
            clearInterval(heartbeat);
            safeError(new Error(chunk.error || "Stream failed"));
          }
        });
      } catch (err) {
        clearInterval(heartbeat);
        safeError(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": isSSE ? "text/event-stream" : "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
};

/**
 * Upstash Workflow definition executing durable AI chat steps.
 * Receives pre-verified payload from the POST route entrypoint.
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

  // 1. Durable AI Generation Step (streaming LLM deltas to Upstash Realtime)
  const generationResult = await context.run("ai-generation", async () => {
    const channel = realtime.channel(channelId);

    try {
      // Signal to client that AI generation is about to start
      await channel.emit("ai.chunk", { type: "typing" });

      // Dispatch RAG retrieval and async user message persistence
      const { ragResult, persistUserPromise } = await dispatchChatPipeline({
        userId,
        conversationId,
        content,
        documentIds,
        conversationHistory,
        skipUserPersistence,
      });

      // Stream LLM text deltas to the Upstash Realtime channel
      const result = streamText({
        model: getChatModel(),
        system: ragResult.systemPrompt,
        messages: ragResult.promptMessages,
      });

      let fullText = "";

      for await (const chunk of result.textStream) {
        fullText += chunk;
        await channel.emit("ai.chunk", {
          type: "text-delta",
          text: chunk,
        });
      }

      // Emit finish chunk
      await channel.emit("ai.chunk", {
        type: "finish",
      });

      // Persist or in-place update assistant message in database
      await persistUserPromise;
      if (replaceAssistantMessageId) {
        await updateMessage(userId, conversationId, replaceAssistantMessageId, fullText);
      } else {
        await persistMessage({
          conversationId,
          role: "assistant",
          content: fullText,
        });
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
      await channel.emit("ai.chunk", {
        type: "error",
        error: errorMessage,
      });
      logger.error("chat.workflow_ai_generation_failed", {
        userId,
        conversationId,
        messageId,
        error: errorMessage,
      });
      throw err;
    }
  });

  // 2. Durable Server-Initiated Title Generation Step
  // Runs durably for initial conversation exchanges, utilizing both user prompt and assistant response
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
          // Emit title event to Upstash Realtime channel
          const convChannel = realtime.channel(conversationId);
          await convChannel.emit("ai.chunk", {
            type: "title",
            title: generatedTitle,
          });
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

/**
 * POST /api/conversations/:id/messages/stream
 *
 * Route entrypoint:
 * - Client Browser Invocations: Authenticated via Clerk, preflight validated, quota-checked.
 *   Returns immediate 401/429/400 HTTP status on validation failure before ever invoking QStash.
 * - QStash Webhook Callbacks: Pass directly to workflowHandler with upstash-signature verification.
 */
export const POST = async (request: Request, { params }: RouteParams) => {
  const isQStashCallback = request.headers.has("upstash-signature") || request.headers.has("Upstash-Signature");

  // 1. If invoked by QStash (internal workflow step callback), pass directly to workflowHandler
  if (isQStashCallback) {
    return workflowHandler(request);
  }

  // 2. Authenticate user via Clerk
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  // 3. Parse and validate incoming payload
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = chatStreamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });
  }

  const {
    content,
    conversationHistory,
    conversationToken,
    messageId,
    streamChannelId,
    skipUserPersistence,
    replaceAssistantMessageId,
  } = parsed.data;

  if (!messageId || !content) {
    return NextResponse.json({ error: "Missing messageId or content" }, { status: 400 });
  }

  // 4. Strict Preflight Verification (HMAC capability token + Redis daily quota check)
  const incomingToken = conversationToken || request.headers.get("x-conversation-token");

  const preflight = await verifyChatPreflight({
    userId,
    conversationId,
    incomingToken,
  });

  if (!preflight.success) {
    if (preflight.error === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid conversation session token" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Daily query limit reached. Your quota resets at midnight UTC." },
      { status: 429 },
    );
  }

  // 5. Construct verified workflow payload and trigger via QStash
  const verifiedPayload: ChatWorkflowPayload = {
    messageId,
    streamChannelId,
    conversationId,
    userId,
    documentIds: preflight.documentIds,
    content,
    conversationHistory,
    skipUserPersistence,
    replaceAssistantMessageId,
  };

  const workflowClient = getWorkflowClient();
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const origin = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const workflowUrl = `${origin}/api/conversations/${conversationId}/messages/stream`;

  try {
    const { workflowRunId } = await workflowClient.trigger({
      url: workflowUrl,
      body: verifiedPayload,
    });

    logger.info("chat.workflow_dispatched", {
      conversationId,
      messageId,
      workflowRunId,
      workflowUrl,
    });

    return NextResponse.json({
      success: true,
      workflowRunId,
      messageId,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error("chat.workflow_trigger_failed", {
      conversationId,
      messageId,
      workflowUrl,
      error: errorMsg,
    });
    return NextResponse.json({ error: "Failed to trigger chat workflow", details: errorMsg }, { status: 500 });
  }
};
