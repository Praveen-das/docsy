import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getConversation, getMessages } from "@/services/conversation.service";
import { updateConversationTitleIfDefault } from "@/services/title.service";

const postTitleSchema = z.object({
  userMessage: z.string().optional(),
  assistantMessage: z.string().optional(),
  force: z.boolean().optional().default(false),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/conversations/:id/title
 * Returns the current title of the conversation.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  const conv = await getConversation(userId, conversationId);

  if (!conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json({ title: conv.title });
}

/**
 * POST /api/conversations/:id/title
 * Generates and saves an AI title for the conversation on demand.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  // 1. Verify conversation ownership
  const conv = await getConversation(userId, conversationId);
  if (!conv) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  // 2. Parse request options
  let userMessage: string | undefined;
  let assistantMessage: string | undefined;
  let force = false;

  try {
    const body = await request.json();
    const parsed = postTitleSchema.safeParse(body);
    if (parsed.success) {
      userMessage = parsed.data.userMessage;
      assistantMessage = parsed.data.assistantMessage;
      force = parsed.data.force;
    }
  } catch {
    // Empty body is acceptable; will extract from conversation messages
  }

  // 3. Generate and persist new title
  const updatedTitle = await updateConversationTitleIfDefault({
    conversationId,
    userId,
    userMessage: userMessage!,
    assistantMessage,
  });

  return NextResponse.json({
    title: updatedTitle || conv.title,
    updated: Boolean(updatedTitle),
  });
}
