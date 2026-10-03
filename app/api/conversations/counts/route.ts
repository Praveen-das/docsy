import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getConversationCounts } from "@/services/conversation.service";

/**
 * GET /api/conversations/counts
 * Total and per-document conversation counts.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getConversationCounts(userId));
}
