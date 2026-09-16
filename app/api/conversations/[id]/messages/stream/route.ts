import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createRealtimeStream, getStreamHeaders } from "@/lib/stream-reader";
import { workflowHandler } from "@/services/chat-workflow.handler";
import { verifyChatPreflight } from "@/services/chat.service";
import { triggerChatWorkflow } from "@/lib/workflow";
import { chatStreamSchema } from "@/lib/validations/chat.schema";
import { logger } from "@/lib/logger";
import type { ChatWorkflowPayload } from "@/types/chat.types";

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

  const isSSE = req.headers.get("accept")?.includes("text/event-stream") ?? false;
  const stream = createRealtimeStream(id, isSSE);

  return new Response(stream, { headers: getStreamHeaders(isSSE) });
};

/**
 * POST /api/conversations/:id/messages/stream
 *
 * Route entrypoint:
 * - Client Browser Invocations: Authenticated via Clerk, preflight validated, quota-checked.
 *   Returns immediate 401/429/400 HTTP status on validation failure before ever invoking QStash.
 * - QStash Webhook Callbacks: Pass directly to workflowHandler with upstash-signature verification.
 */
export const POST = async (request: Request, { params }: RouteParams) => {
  // 1. QStash internal callbacks bypass auth and go straight to the workflow handler
  const isQStashCallback =
    request.headers.has("upstash-signature") ||
    request.headers.has("Upstash-Signature");

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

  const preflight = await verifyChatPreflight({ userId, conversationId, incomingToken });

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

  // 5. Construct verified payload and dispatch durable workflow via QStash
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

  try {
    const { workflowRunId } = await triggerChatWorkflow(request, conversationId, verifiedPayload);

    return NextResponse.json({ success: true, workflowRunId, messageId });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error("chat.workflow_trigger_failed", {
      conversationId,
      messageId,
      error: errorMsg,
    });
    return NextResponse.json(
      { error: "Failed to trigger chat workflow", details: errorMsg },
      { status: 500 },
    );
  }
};
