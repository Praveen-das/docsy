import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getConversation,
  togglePinConversation,
} from "@/services/conversation.service";

/**
 * POST /api/conversations/:id/pin
 * Toggle pin status for a conversation.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify conversation exists and belongs to user
  const conv = await getConversation(userId, id);
  if (!conv) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const result = await togglePinConversation(userId, id);

  return NextResponse.json({
    success: true,
    conversationId: id,
    isPinned: result.isPinned,
  });
}
