import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateMessage, deleteMessage } from "@/services/conversation.service";
import { verifyConversationToken } from "@/lib/conversation-token";

const editMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

interface RouteParams {
  params: Promise<{ id: string; messageId: string }>;
}

/**
 * PATCH /api/conversations/:id/messages/:messageId
 * Update an existing message's content (e.g. editing a user message).
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id, messageId } = await params;
  const token =
    request.headers.get("x-conversation-token") ||
    request.nextUrl.searchParams.get("token") ||
    undefined;

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

  try {
    const body = await request.json();
    const parsed = editMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });
    }

    const updated = await updateMessage(userId, id, messageId, parsed.data.content, token);

    if (!updated) {
      return NextResponse.json({ error: "Message not found or update unauthorized" }, { status: 404 });
    }

    return NextResponse.json({
      id: updated.id,
      conversationId: updated.conversationId,
      role: updated.role,
      content: updated.content,
      sources: updated.sources || [],
      createdAt: updated.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

/**
 * DELETE /api/conversations/:id/messages/:messageId
 * Delete a message from the conversation.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id, messageId } = await params;
  const token =
    request.headers.get("x-conversation-token") ||
    request.nextUrl.searchParams.get("token") ||
    undefined;

  let userId: string | null = null;

  if (token) {
    const payload = await verifyConversationToken(token);
    if (payload && payload.conversationId === id) {
      userId = payload.userId;
    }
  }

  if (!userId) {
    const clerkAuth = await auth();
    userId = clerkAuth.userId;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const success = await deleteMessage(userId, id, messageId, token);

  if (!success) {
    return NextResponse.json({ error: "Message not found or delete unauthorized" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
