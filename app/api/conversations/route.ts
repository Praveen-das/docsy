import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createConversation,
  listConversations,
  listPinnedConversationIds,
  deleteAllConversations,
} from "@/services/conversation.service";

const createConversationSchema = z.object({
  id: z.string().uuid().optional(),
  documentIds: z.array(z.string()).min(1, "At least one document is required"),
  title: z.string().optional(),
});

import { signConversationToken } from "@/lib/conversation-token";

const listQuerySchema = z.object({
  documentId: z.string().optional(),
  search: z.string().max(200).optional(),
  pinned: z.enum(["true"]).optional(),
  sort: z.enum(["newest", "oldest", "title"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

/**
 * GET /api/conversations?documentId=&search=&pinned=true&sort=&limit=&offset=
 * List conversations for the authenticated user. Without `limit`, returns all.
 * With `limit`, returns one page plus `nextOffset` (null when exhausted).
 */
export async function GET(request?: NextRequest) {
  const t0 = performance.now();
  const { userId } = await auth();
  const tAuth = performance.now() - t0;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request?.nextUrl?.searchParams;
  const parsed = listQuerySchema.safeParse(searchParams ? Object.fromEntries(searchParams) : {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { limit, offset = 0, pinned, ...filters } = parsed.data;

  // Fetch one extra row to know whether another page exists.
  const timed = async <T>(p: Promise<T>) => {
    const s = performance.now();
    const value = await p;
    return { value, ms: performance.now() - s };
  };
  const [list, pins] = await Promise.all([
    timed(listConversations(userId, { ...filters, pinned: pinned === "true", limit: limit && limit + 1, offset })),
    timed(listPinnedConversationIds(userId)),
  ]);
  const rows = list.value;
  const hasMore = limit !== undefined && rows.length > limit;
  const conversations = hasMore ? rows.slice(0, limit) : rows;

  return NextResponse.json(
    { conversations, pinnedIds: pins.value, nextOffset: hasMore ? offset + limit! : null },
    {
      headers: {
        "Server-Timing": `auth;dur=${tAuth.toFixed(0)}, list;dur=${list.ms.toFixed(0)}, pins;dur=${pins.ms.toFixed(0)}, handler;dur=${(performance.now() - t0).toFixed(0)}`,
      },
    },
  );
}

/**
 * POST /api/conversations
 * Create a new conversation linked to one or more documents and return a stream capability token.
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createConversationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const conv = await createConversation(userId, parsed.data.documentIds, parsed.data.title, parsed.data.id);

    const streamToken = await signConversationToken({
      userId,
      conversationId: conv.id,
      documentIds: parsed.data.documentIds,
    });

    return NextResponse.json(
      {
        id: conv.id,
        userId: conv.userId,
        title: conv.title,
        documentIds: parsed.data.documentIds,
        messageCount: 0,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        streamToken,
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}

/**
 * DELETE /api/conversations
 * Atomic bulk deletion of all conversations for the authenticated user.
 */
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await deleteAllConversations(userId);
    return NextResponse.json({ success: true, count });
  } catch {
    return NextResponse.json({ error: "Failed to delete conversations" }, { status: 500 });
  }
}
