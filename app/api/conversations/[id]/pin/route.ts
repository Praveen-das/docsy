import { NextResponse } from "next/server";
import { withAuthRoute } from "@/lib/api-auth";
import {
  getConversation,
  togglePinConversation,
} from "@/services/conversation.service";

/**
 * POST /api/conversations/:id/pin
 * Toggle pin status for a conversation.
 */
export const POST = withAuthRoute(async ({ userId, params }) => {
  const conv = await getConversation(userId, params.id);
  if (!conv) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const result = await togglePinConversation(userId, params.id);

  return NextResponse.json({
    success: true,
    conversationId: params.id,
    isPinned: result.isPinned,
  });
});
