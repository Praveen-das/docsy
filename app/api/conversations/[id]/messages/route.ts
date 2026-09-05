import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getMessages,
  persistMessage,
  getConversation,
} from "@/services/conversation.service";

const sendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

/**
 * GET /api/conversations/:id/messages
 * Retrieve chronological messages for a conversation.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const msgs = await getMessages(userId, id);

  return NextResponse.json(
    msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      sources: m.sources || [],
      createdAt: m.createdAt.toISOString(),
    }))
  );
}

/**
 * POST /api/conversations/:id/messages
 * Save a user message (non-streaming). Used for persisting user messages.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify conversation ownership
  const conv = await getConversation(userId, id);
  if (!conv) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
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
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
