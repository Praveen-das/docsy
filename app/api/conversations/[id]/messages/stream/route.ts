import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import {
  getConversation,
  getConversationDocumentIds,
  getMessages,
  persistMessage,
} from "@/services/conversation.service";
import { incrementQueryCount } from "@/services/user.service";
import { executeRAG } from "@/services/rag.service";
import { logger } from "@/lib/logger";

const streamSchema = z.object({
  content: z.string().min(1).max(10000),
});

/**
 * POST /api/conversations/:id/messages/stream
 *
 * The core RAG + streaming endpoint:
 * 1. Authenticate & verify conversation ownership
 * 2. Check daily query quota
 * 3. Persist user message
 * 4. Run RAG pipeline (embed query → Pinecone retrieval → context build)
 * 5. Stream Gemini response via Vercel AI SDK
 * 6. On completion: persist assistant message + sources
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  // Verify conversation ownership
  const conv = await getConversation(userId, conversationId);
  if (!conv) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  // Parse and validate request body
  let content: string;
  try {
    const body = await request.json();
    const parsed = streamSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid message content" },
        { status: 400 }
      );
    }
    content = parsed.data.content;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  // Check daily query quota
  const quotaAllowed = await incrementQueryCount(userId);
  if (!quotaAllowed) {
    return NextResponse.json(
      {
        error:
          "Daily query limit reached. Your quota resets at midnight UTC.",
      },
      { status: 429 }
    );
  }

  logger.info("chat.started", { userId, conversationId });

  try {
    // Persist user message
    await persistMessage({
      conversationId,
      role: "user",
      content,
    });

    // Get linked document IDs for scoped retrieval
    const documentIds = await getConversationDocumentIds(conversationId);

    // Get conversation history for multi-turn context
    const allMessages = await getMessages(userId, conversationId);
    const conversationHistory = allMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    // Execute RAG pipeline
    const ragResult = await executeRAG(
      userId,
      content,
      documentIds,
      conversationHistory
    );

    // Stream response from Gemini via Vercel AI SDK
    const result = streamText({
      model: google("gemini-2.0-flash"),
      messages: ragResult.promptMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      async onFinish({ text }) {
        // Persist the completed assistant message with sources
        await persistMessage({
          conversationId,
          role: "assistant",
          content: text,
          sources: ragResult.sources,
        });

        logger.info("chat.completed", {
          userId,
          conversationId,
          sourceCount: ragResult.sources.length,
          responseLength: text.length,
        });
      },
    });

    // Return the streaming response with sources in headers
    return result.toTextStreamResponse({
      headers: {
        "x-sources": encodeURIComponent(JSON.stringify(ragResult.sources)),
      },
    });
  } catch (err) {
    logger.error("chat.failed", {
      userId,
      conversationId,
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
