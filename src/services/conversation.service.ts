import { db } from "@/db";
import {
  conversations,
  conversationDocuments,
  messages,
  pinnedConversations,
} from "@/db/schema";
import { eq, and, or, lt, desc, asc, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import {
  getCached,
  setCached,
  invalidateCache,
  CACHE_TTL,
} from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache-keys";
import { verifyConversationToken } from "@/lib/conversation-token";

import type {
  ConversationRecord,
  MessageRecord,
  NewMessage,
} from "@/db/schema";

/**
 * Ensures date fields are proper Date instances when deserialized from JSON cache.
 */
function normalizeMessageDates(msg: MessageRecord): MessageRecord {
  return {
    ...msg,
    createdAt: new Date(msg.createdAt),
  };
}

// --- Conversations ---

/**
 * Create a conversation linked to one or more documents.
 */
export async function createConversation(
  userId: string,
  documentIds: string[],
  title?: string,
  id?: string
): Promise<ConversationRecord> {
  const [conv] = await db
    .insert(conversations)
    .values({
      ...(id ? { id } : {}),
      userId,
      title: title || "New Conversation",
    })
    .returning();

  // Link documents to conversation
  if (documentIds.length > 0) {
    await db.insert(conversationDocuments).values(
      documentIds.map((docId) => ({
        conversationId: conv.id,
        documentId: docId,
      }))
    );
  }

  // Invalidate user's conversation list cache
  await invalidateCache(CACHE_KEYS.conversationList(userId));

  logger.info("conversation.created", {
    conversationId: conv.id,
    userId,
    documentIds,
  });

  return conv;
}

/**
 * Internal helper to query and enrich conversations from PostgreSQL.
 */
async function fetchEnrichedConversations(userId: string) {
  const convs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));

  return Promise.all(
    convs.map(async (conv) => {
      const docLinks = await db
        .select({ documentId: conversationDocuments.documentId })
        .from(conversationDocuments)
        .where(eq(conversationDocuments.conversationId, conv.id));

      const lastMessage = await db
        .select({ content: messages.content, role: messages.role })
        .from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      const msgCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .where(eq(messages.conversationId, conv.id));

      return {
        id: conv.id,
        userId: conv.userId,
        title: conv.title,
        documentIds: docLinks.map((d) => d.documentId),
        lastMessageSnippet: lastMessage[0]
          ? lastMessage[0].content.slice(0, 100)
          : undefined,
        messageCount: msgCount[0]?.count || 0,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      };
    })
  );
}

/**
 * List conversations for a user with metadata:
 * - Document associations
 * - Last message snippet
 * - Message count
 * Backed by Redis cache (120s TTL). Eliminates heavy N+1 multi-table subqueries.
 */
export async function listConversations(userId: string) {
  const cacheKey = CACHE_KEYS.conversationList(userId);
  const cached = await getCached<Awaited<ReturnType<typeof fetchEnrichedConversations>>>(cacheKey);
  if (cached) {
    return cached;
  }

  const enriched = await fetchEnrichedConversations(userId);
  await setCached(cacheKey, enriched, CACHE_TTL.CONVERSATIONS_LIST);
  return enriched;
}

/**
 * Get a single conversation with ownership verification.
 * Backed by Redis cache (180s TTL).
 */
export async function getConversation(userId: string, convId: string) {
  const cacheKey = CACHE_KEYS.conversationDetail(convId);
  const cached = await getCached<{
    id: string;
    userId: string;
    title: string;
    documentIds: string[];
    createdAt: string;
    updatedAt: string;
  }>(cacheKey);

  if (cached) {
    if (cached.userId === userId) {
      return cached;
    }
    return null;
  }

  // On cache miss: query conversation and linked documents in parallel
  const [result, docLinks] = await Promise.all([
    db
      .select()
      .from(conversations)
      .where(
        and(eq(conversations.id, convId), eq(conversations.userId, userId))
      )
      .limit(1),
    db
      .select({ documentId: conversationDocuments.documentId })
      .from(conversationDocuments)
      .where(eq(conversationDocuments.conversationId, convId)),
  ]);

  if (result.length === 0) return null;

  const conv = result[0];
  const convData = {
    ...conv,
    documentIds: docLinks.map((d) => d.documentId),
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
  };

  // Populate cache asynchronously without blocking return
  setCached(cacheKey, convData, CACHE_TTL.CONVERSATION_DETAIL).catch(() => {});

  return convData;
}

/**
 * Retrieve conversation by ID without requiring prior userId knowledge (used by background workflows).
 */
export async function getConversationById(convId: string) {
  const [result, docLinks] = await Promise.all([
    db
      .select()
      .from(conversations)
      .where(eq(conversations.id, convId))
      .limit(1),
    db
      .select({ documentId: conversationDocuments.documentId })
      .from(conversationDocuments)
      .where(eq(conversationDocuments.conversationId, convId)),
  ]);

  if (result.length === 0) return null;

  const conv = result[0];
  return {
    id: conv.id,
    userId: conv.userId,
    title: conv.title,
    documentIds: docLinks.map((d) => d.documentId),
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
  };
}


/**
 * Get document IDs linked to a conversation (used by RAG pipeline).
 */
export async function getConversationDocumentIds(
  convId: string
): Promise<string[]> {
  const links = await db
    .select({ documentId: conversationDocuments.documentId })
    .from(conversationDocuments)
    .where(eq(conversationDocuments.conversationId, convId));

  return links.map((l) => l.documentId);
}

/**
 * Rename a conversation (ownership must be pre-verified).
 */
export async function renameConversation(
  userId: string,
  convId: string,
  title: string
): Promise<boolean> {
  const result = await db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(
      and(eq(conversations.id, convId), eq(conversations.userId, userId))
    )
    .returning({ id: conversations.id });

  if (result.length > 0) {
    await invalidateCache(
      CACHE_KEYS.conversationList(userId),
      CACHE_KEYS.conversationDetail(convId),
    );
    return true;
  }

  return false;
}

/**
 * Delete a conversation and cascade-delete messages.
 * Does NOT delete underlying documents (PRD §22 FR-22).
 */
export async function deleteConversation(
  userId: string,
  convId: string
): Promise<boolean> {
  const result = await db
    .delete(conversations)
    .where(
      and(eq(conversations.id, convId), eq(conversations.userId, userId))
    )
    .returning({ id: conversations.id });

  if (result.length > 0) {
    await invalidateCache(
      CACHE_KEYS.conversationList(userId),
      CACHE_KEYS.conversationDetail(convId),
      CACHE_KEYS.conversationMessages(convId),
    );
    logger.info("conversation.deleted", { conversationId: convId, userId });
    return true;
  }

  return false;
}

// --- Messages ---

/**
 * Verifies conversation ownership, preferring fast in-memory JWT cryptographic validation (<0.05ms)
 * and falling back to cached/DB lookup if token is missing or invalid.
 */
export async function verifyConversationOwnership(
  userId: string,
  convId: string,
  token?: string
): Promise<boolean> {
  if (token) {
    const payload = await verifyConversationToken(token);
    if (payload && payload.userId === userId && payload.conversationId === convId) {
      return true;
    }
  }

  const conv = await getConversation(userId, convId);
  return Boolean(conv);
}

/**
 * Get chronological messages for a conversation (with ownership check).
 * Backed by Redis cache (180s TTL).
 * Uses JWT session token for instant in-memory ownership verification (<0.05ms)
 * with graceful fallback to DB/cache.
 */
export interface PaginatedMessagesResult {
  messages: MessageRecord[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Encodes a message's timestamp and unique ID into an opaque, URL-safe cursor.
 */
export function encodeCursor(message: { createdAt: Date | string; id: string }): string {
  const iso = typeof message.createdAt === "string" ? message.createdAt : message.createdAt.toISOString();
  return Buffer.from(`${iso}|${message.id}`).toString("base64url");
}

/**
 * Decodes a cursor string back into its constituent timestamp and message ID.
 */
export function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const [iso, id] = raw.split("|");
    if (!iso || !id) return null;
    const date = new Date(iso);
    if (isNaN(date.getTime())) return null;
    return { createdAt: date, id };
  } catch {
    return null;
  }
}

/**
 * Get paginated chronological messages for a conversation (with ownership check).
 * Uses cursor-based pagination backed by PostgreSQL index on (conversation_id, created_at).
 * Caches the initial page (latest messages) in Redis (180s TTL).
 */
export async function getPaginatedMessages(
  userId: string,
  convId: string,
  options: { limit?: number; cursor?: string; token?: string } = {}
): Promise<PaginatedMessagesResult> {
  // Fast path: Verify conversation ownership via JWT, falling back to cache/DB
  const isOwner = await verifyConversationOwnership(userId, convId, options.token);
  if (!isOwner) {
    return { messages: [], nextCursor: null, hasMore: false };
  }

  const limit = Math.max(1, Math.min(options.limit ?? 30, 100));
  const { cursor } = options;

  // Fast path: Check Redis cache for initial batch (latest messages)
  if (!cursor && limit === 30) {
    const cacheKey = CACHE_KEYS.conversationMessages(convId);
    const cached = await getCached<PaginatedMessagesResult>(cacheKey);
    if (cached && Array.isArray(cached.messages)) {
      return {
        ...cached,
        messages: cached.messages.map(normalizeMessageDates),
      };
    }
  }

  const whereConditions = [eq(messages.conversationId, convId)];

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      whereConditions.push(
        or(
          lt(messages.createdAt, decoded.createdAt),
          and(
            eq(messages.createdAt, decoded.createdAt),
            lt(messages.id, decoded.id)
          )
        )!
      );
    }
  }

  // Fetch limit + 1 in descending order using (conversationId, createdAt) index
  const rows = await db
    .select()
    .from(messages)
    .where(and(...whereConditions))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  // Next cursor points to oldest message in descending batch (last element)
  const nextCursor =
    hasMore && pageRows.length > 0 ? encodeCursor(pageRows[pageRows.length - 1]) : null;

  // Reverse back to ascending chronological order (oldest to newest)
  pageRows.reverse();

  const result: PaginatedMessagesResult = {
    messages: pageRows,
    nextCursor,
    hasMore,
  };

  // Cache initial page in Redis
  if (!cursor && limit === 30) {
    const cacheKey = CACHE_KEYS.conversationMessages(convId);
    await setCached(cacheKey, result, CACHE_TTL.MESSAGES_LIST);
  }

  return result;
}

/**
 * Get chronological messages for a conversation (with ownership check).
 * Backed by Redis cache (180s TTL).
 * Uses JWT session token for instant in-memory ownership verification (<0.05ms)
 * with graceful fallback to DB/cache.
 */
export async function getMessages(
  userId: string,
  convId: string,
  token?: string
): Promise<MessageRecord[]> {
  // Fast path: Verify conversation ownership via JWT, falling back to cache/DB
  const isOwner = await verifyConversationOwnership(userId, convId, token);
  if (!isOwner) return [];

  const cacheKey = CACHE_KEYS.conversationMessages(convId);
  const cached = await getCached<unknown>(cacheKey);
  if (cached) {
    if (Array.isArray(cached)) {
      return cached.map(normalizeMessageDates);
    }
    if (typeof cached === "object" && cached !== null && "messages" in cached && Array.isArray((cached as { messages: MessageRecord[] }).messages)) {
      return (cached as { messages: MessageRecord[] }).messages.map(normalizeMessageDates);
    }
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(asc(messages.createdAt));

  return msgs;
}

/**
 * Persist a message to the database.
 * Combines message insertion and conversation touch into a single atomic CTE database roundtrip.
 * Cache invalidation is triggered asynchronously without blocking execution.
 */
export async function persistMessage(
  data: NewMessage
): Promise<MessageRecord> {
  const sourcesParam = data.sources ? JSON.stringify(data.sources) : "[]";

  const rows = await db.execute<{
    id: string;
    conversation_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    sources: unknown;
    created_at: string | Date;
    user_id: string | null;
  }>(sql`
    WITH inserted_message AS (
      INSERT INTO messages (${data.id ? sql`id, ` : sql``}conversation_id, role, content, sources)
      VALUES (${data.id ? sql`${data.id}::uuid, ` : sql``}${data.conversationId}::uuid, ${data.role}, ${data.content}, ${sourcesParam}::jsonb)
      RETURNING id, conversation_id, role, content, sources, created_at
    ),
    updated_conversation AS (
      UPDATE conversations
      SET updated_at = NOW()
      WHERE id = ${data.conversationId}::uuid
      RETURNING user_id
    )
    SELECT 
      im.id,
      im.conversation_id,
      im.role,
      im.content,
      im.sources,
      im.created_at,
      uc.user_id
    FROM inserted_message im
    LEFT JOIN updated_conversation uc ON true;
  `);

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to persist message: No record returned from database");
  }

  const msg: MessageRecord = {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    sources: (row.sources as unknown as MessageRecord["sources"]) ?? [],
    createdAt: new Date(row.created_at),
  };

  // Invalidate Redis cache completely in background (non-blocking)
  if (row.user_id) {
    invalidateCache(
      CACHE_KEYS.conversationMessages(data.conversationId),
      CACHE_KEYS.conversationList(row.user_id),
    ).catch((err) => {
      logger.warn("cache.invalidation_failed", { error: String(err) });
    });
  } else {
    invalidateCache(CACHE_KEYS.conversationMessages(data.conversationId)).catch(() => {});
  }

  return msg;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Update a message's content (e.g. for user message editing or assistant response regeneration).
 * Verifies conversation ownership, validates UUID, touches conversation timestamp, and invalidates Redis caches.
 */
export async function updateMessage(
  userId: string,
  convId: string,
  messageId: string,
  content: string,
  token?: string
): Promise<MessageRecord | null> {
  if (!UUID_REGEX.test(messageId) || !UUID_REGEX.test(convId)) {
    return null;
  }

  const isOwner = await verifyConversationOwnership(userId, convId, token);
  if (!isOwner) return null;

  const rows = await db.execute<{
    id: string;
    conversation_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    sources: unknown;
    created_at: string | Date;
  }>(sql`
    WITH updated_message AS (
      UPDATE messages
      SET content = ${content}
      WHERE id = ${messageId}::uuid AND conversation_id = ${convId}::uuid
      RETURNING id, conversation_id, role, content, sources, created_at
    ),
    touched_conversation AS (
      UPDATE conversations
      SET updated_at = NOW()
      WHERE id = ${convId}::uuid
      RETURNING id
    )
    SELECT 
      um.id,
      um.conversation_id,
      um.role,
      um.content,
      um.sources,
      um.created_at
    FROM updated_message um;
  `);

  const row = rows[0];
  if (!row) return null;

  const msg: MessageRecord = {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    sources: (row.sources as unknown as MessageRecord["sources"]) ?? [],
    createdAt: new Date(row.created_at),
  };

  invalidateCache(
    CACHE_KEYS.conversationMessages(convId),
    CACHE_KEYS.conversationList(userId)
  ).catch((err) => {
    logger.warn("cache.invalidation_failed", { error: String(err) });
  });

  logger.info("message.updated", { conversationId: convId, messageId });
  return msg;
}

/**
 * Delete a message from a conversation (with ownership verification).
 */
export async function deleteMessage(
  userId: string,
  convId: string,
  messageId: string,
  token?: string
): Promise<boolean> {
  if (!UUID_REGEX.test(messageId) || !UUID_REGEX.test(convId)) {
    return false;
  }

  const isOwner = await verifyConversationOwnership(userId, convId, token);
  if (!isOwner) return false;

  const result = await db
    .delete(messages)
    .where(and(eq(messages.id, messageId), eq(messages.conversationId, convId)))
    .returning({ id: messages.id });

  if (result.length > 0) {
    invalidateCache(
      CACHE_KEYS.conversationMessages(convId),
      CACHE_KEYS.conversationList(userId)
    ).catch((err) => {
      logger.warn("cache.invalidation_failed", { error: String(err) });
    });
    logger.info("message.deleted", { conversationId: convId, messageId });
    return true;
  }

  return false;
}

// --- Pinned Conversations ---

/**
 * List all pinned conversation IDs for a user.
 * Cached in Redis (120s TTL).
 */
export async function listPinnedConversationIds(userId: string): Promise<string[]> {
  const cacheKey = CACHE_KEYS.pinnedConversations(userId);
  const cached = await getCached<string[]>(cacheKey);
  if (cached) return cached;

  const rows = await db
    .select({ conversationId: pinnedConversations.conversationId })
    .from(pinnedConversations)
    .where(eq(pinnedConversations.userId, userId));

  const ids = rows.map((r) => r.conversationId);
  await setCached(cacheKey, ids, CACHE_TTL.DOCUMENTS_LIST);
  return ids;
}

/**
 * Toggle pin status of a conversation for a user.
 */
export async function togglePinConversation(
  userId: string,
  conversationId: string
): Promise<{ isPinned: boolean }> {
  const existing = await db
    .select()
    .from(pinnedConversations)
    .where(
      and(
        eq(pinnedConversations.userId, userId),
        eq(pinnedConversations.conversationId, conversationId)
      )
    )
    .limit(1);

  let isPinned = false;

  if (existing.length > 0) {
    await db
      .delete(pinnedConversations)
      .where(
        and(
          eq(pinnedConversations.userId, userId),
          eq(pinnedConversations.conversationId, conversationId)
        )
      );
  } else {
    await db.insert(pinnedConversations).values({ userId, conversationId });
    isPinned = true;
  }

  await invalidateCache(
    CACHE_KEYS.pinnedConversations(userId),
    CACHE_KEYS.conversationList(userId)
  );

  logger.info("conversation.pin_toggled", { conversationId, userId, isPinned });
  return { isPinned };
}

/**
 * Delete all conversations for a user in a single atomic SQL query.
 * Messages, pinned conversations, and conversation_documents cascade delete via foreign keys.
 */
export async function deleteAllConversations(userId: string): Promise<number> {
  const result = await db
    .delete(conversations)
    .where(eq(conversations.userId, userId))
    .returning({ id: conversations.id });

  await invalidateCache(
    CACHE_KEYS.conversationList(userId),
    CACHE_KEYS.pinnedConversations(userId)
  );

  logger.info("conversations.all_deleted", { userId, count: result.length });
  return result.length;
}
