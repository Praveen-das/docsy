import { db } from "@/db";
import {
  conversations,
  conversationDocuments,
  messages,
  documents,
} from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

import type {
  ConversationRecord,
  MessageRecord,
  NewMessage,
} from "@/db/schema";

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

  logger.info("conversation.created", {
    conversationId: conv.id,
    userId,
    documentIds,
  });

  return conv;
}

/**
 * List conversations for a user with metadata:
 * - Document associations
 * - Last message snippet
 * - Message count
 */
export async function listConversations(userId: string) {
  const convs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));

  // Enrich with document IDs and last message for each conversation
  const enriched = await Promise.all(
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

  return enriched;
}

/**
 * Get a single conversation with ownership verification.
 */
export async function getConversation(userId: string, convId: string) {
  const result = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.id, convId), eq(conversations.userId, userId))
    )
    .limit(1);

  if (result.length === 0) return null;

  const conv = result[0];
  const docLinks = await db
    .select({ documentId: conversationDocuments.documentId })
    .from(conversationDocuments)
    .where(eq(conversationDocuments.conversationId, conv.id));

  return {
    ...conv,
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

  return result.length > 0;
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
    logger.info("conversation.deleted", { conversationId: convId, userId });
    return true;
  }

  return false;
}

// --- Messages ---

/**
 * Get chronological messages for a conversation (with ownership check).
 */
export async function getMessages(
  userId: string,
  convId: string
): Promise<MessageRecord[]> {
  // Verify conversation ownership first
  const conv = await getConversation(userId, convId);
  if (!conv) return [];

  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, convId))
    .orderBy(asc(messages.createdAt));
}

/**
 * Persist a message to the database.
 */
export async function persistMessage(
  data: NewMessage
): Promise<MessageRecord> {
  const [msg] = await db.insert(messages).values(data).returning();

  // Touch conversation's updatedAt
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, data.conversationId));

  return msg;
}
