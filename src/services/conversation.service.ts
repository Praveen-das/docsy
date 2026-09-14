import { db } from "@/db";
import {
  conversations,
  conversationDocuments,
  messages,
  documents,
} from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import {
  getCached,
  setCached,
  invalidateCache,
  CACHE_TTL,
} from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache-keys";

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
 * Get chronological messages for a conversation (with ownership check).
 * Backed by Redis cache (180s TTL).
 */
export async function getMessages(
  userId: string,
  convId: string
): Promise<MessageRecord[]> {
  // Verify conversation ownership first
  const conv = await getConversation(userId, convId);
  if (!conv) return [];

  const cacheKey = CACHE_KEYS.conversationMessages(convId);
  const cached = await getCached<MessageRecord[]>(cacheKey);
  if (cached) {
    return cached.map(normalizeMessageDates);
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(asc(messages.createdAt));

  await setCached(cacheKey, msgs, CACHE_TTL.MESSAGES_LIST);
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
    sources: row.sources as any,
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
