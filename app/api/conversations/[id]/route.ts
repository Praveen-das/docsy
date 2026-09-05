import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getConversation,
  renameConversation,
  deleteConversation,
} from "@/services/conversation.service";

const renameSchema = z.object({
  title: z.string().min(1).max(200),
});

/**
 * GET /api/conversations/:id
 * Get conversation details with ownership verification.
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
  const conv = await getConversation(userId, id);

  if (!conv) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(conv);
}

/**
 * PATCH /api/conversations/:id
 * Rename a conversation.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteConversation(userId, id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
