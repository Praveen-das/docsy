import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getMessages,
  getPaginatedMessages,
  persistMessage,
  verifyConversationOwnership,
} from "@/services/conversation.service";
import { verifyConversationToken } from "@/lib/conversation-token";

const sendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

/**
 * GET /api/conversations/:id/messages
 * Retrieve paginated chronological messages for a conversation.
 * Accepts optional query parameters: `limit` (default 30) and `cursor`.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get("x-conversation-token") || request.nextUrl.searchParams.get("token") || undefined;

  let userId: string | null = null;

  // 1. Fast-path: Extract verified userId directly from JWT capability token (<0.05ms)
  if (token) {
    const payload = await verifyConversationToken(token);
    if (payload && payload.conversationId === id) {
      userId = payload.userId;
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const cursorParam = request.nextUrl.searchParams.get("cursor") || undefined;
  const parsedLimit = limitParam ? parseInt(limitParam, 10) : undefined;
  const limit = parsedLimit && !isNaN(parsedLimit) ? parsedLimit : 30;

  const result = await getPaginatedMessages(userId, id, {
    limit,
    cursor: cursorParam,
    token,
  });

  return NextResponse.json({
    messages: result.messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      sources: (m.sources as unknown as any[]) || [],
      createdAt: m.createdAt.toISOString(),
    })),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  });
}

/**
 * POST /api/conversations/:id/messages
 * Save a user message (non-streaming). Used for persisting user messages.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get("x-conversation-token") || request.nextUrl.searchParams.get("token") || undefined;

  let userId: string | null = null;

  // 1. Fast-path: Extract verified userId directly from JWT capability token (<0.05ms)
  if (token) {
    const payload = await verifyConversationToken(token);
    if (payload && payload.conversationId === id) {
      userId = payload.userId;
    }
  }

  // 2. Fallback: Authenticate via Clerk session if no valid conversation token
  if (!userId) {
    const clerkAuth = await auth();
    userId = clerkAuth.userId;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOwner = await verifyConversationOwnership(userId, id, token);
  if (!isOwner) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const msg = await persistMessage({
      conversationId: id,
      role: "user",
      content: parsed.data.content,
    });

    return NextResponse.json(
      {
        id: msg.id,
        conversationId: msg.conversationId,
        role: msg.role,
        content: msg.content,
        sources: msg.sources || [],
        createdAt: msg.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
