import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthRouteContext } from "@/lib/api-auth";
import {
  getConversation,
  renameConversation,
  deleteConversation,
} from "@/services/conversation.service";

const renameSchema = z.object({
  title: z.string().min(1).max(200),
});

import { signConversationToken } from "@/lib/conversation-token";

/**
 * GET /api/conversations/:id
 * Get conversation details with ownership verification and stream capability token.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthRouteContext(params);
  if (auth.errorResponse) return auth.errorResponse;
  const { userId, params: { id } } = auth;
  const conv = await getConversation(userId, id);

  if (!conv) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const streamToken = await signConversationToken({
    userId,
    conversationId: conv.id,
    documentIds: conv.documentIds,
  });

  return NextResponse.json({
    ...conv,
    streamToken,
  });
}

/**
 * PATCH /api/conversations/:id
 * Rename a conversation.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthRouteContext(params);
  if (auth.errorResponse) return auth.errorResponse;
  const { userId, params: { id } } = auth;

  try {
    const body = await request.json();
    const parsed = renameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid title" },
        { status: 400 }
      );
    }

    const success = await renameConversation(userId, id, parsed.data.title);

    if (!success) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to rename conversation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/:id
 * Delete a conversation and its messages (NOT its documents).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthRouteContext(params);
  if (auth.errorResponse) return auth.errorResponse;
  const { userId, params: { id } } = auth;
  const deleted = await deleteConversation(userId, id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
