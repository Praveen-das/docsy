import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateMessage, deleteMessage } from "@/services/conversation.service";
import { getConversationTokenContext } from "@/lib/api-auth";

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
  const auth = await getConversationTokenContext(request, params);
  if (!auth.success) return auth.errorResponse;
  const { id, messageId } = auth.params;
  const { userId } = auth;

  try {
    const body = await request.json();
    const parsed = editMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });
    }

    const updated = await updateMessage(userId, id, messageId, parsed.data.content);

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
  const auth = await getConversationTokenContext(request, params);
  if (!auth.success) return auth.errorResponse;
  const { id, messageId } = auth.params;
  const { userId } = auth;

  const success = await deleteMessage(userId, id, messageId);

  if (!success) {
    return NextResponse.json({ error: "Message not found or delete unauthorized" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
