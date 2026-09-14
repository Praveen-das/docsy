import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createConversation,
  listConversations,
} from "@/services/conversation.service";

const createConversationSchema = z.object({
  id: z.string().uuid().optional(),
  documentIds: z.array(z.string()).min(1, "At least one document is required"),
  title: z.string().optional(),
});

import { signConversationToken } from "@/lib/conversation-token";

/**
 * GET /api/conversations
 * List all conversations for the authenticated user with stream capability tokens.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await listConversations(userId);
  const withTokens = await Promise.all(
    conversations.map(async (conv) => ({
      ...conv,
      streamToken: await signConversationToken({
        userId,
        conversationId: conv.id,
        documentIds: conv.documentIds,
      }),
    }))
  );

  return NextResponse.json(withTokens);
}

/**
 * POST /api/conversations
 * Create a new conversation linked to one or more documents and return a stream capability token.
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createConversationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const conv = await createConversation(
      userId,
      parsed.data.documentIds,
      parsed.data.title,
      parsed.data.id
    );

    const streamToken = await signConversationToken({
      userId,
      conversationId: conv.id,
      documentIds: parsed.data.documentIds,
    });

    return NextResponse.json(
      {
        id: conv.id,
        userId: conv.userId,
        title: conv.title,
        documentIds: parsed.data.documentIds,
        messageCount: 0,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        streamToken,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
