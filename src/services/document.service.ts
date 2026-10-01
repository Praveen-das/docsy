import { db } from "@/db";
import { documents, favoriteDocuments } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { triggerProcessingWorkflow } from "@/lib/workflow";
import { logger } from "@/lib/logger";
import {
  setDocumentStatus,
  getDocumentStatusesPipeline,
  getCached,
  setCached,
  invalidateCache,
  CACHE_TTL,
} from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache-keys";
import {
  buildStatusUpdatePayload,
  cleanupDocumentStorageAndVectors,
  cleanupAllDocumentsStorageAndVectors,
  resolveMissingDocumentStatus,
  type UpdateStatusOptions,
} from "./document-status.helper";

import type { DocumentRecord, NewDocument } from "@/db/schema";
import type { DocumentStatusDto } from "@/types";

export type { UpdateStatusOptions };

/**
 * Ensures date fields are proper Date instances when deserialized from JSON cache.
 */
function normalizeDocumentDates(doc: DocumentRecord): DocumentRecord {
  return {
    ...doc,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  };
}

/**
 * Create a new document record in the database.
 */
export async function createDocument(data: NewDocument): Promise<DocumentRecord> {
  const [doc] = await db.insert(documents).values(data).returning();

  logger.info("document.uploaded", {
    documentId: doc.id,
    userId: doc.userId,
    filename: doc.originalName,
    fileSize: doc.fileSize,
  });

  // Seed Redis status cache with TTL
  await setDocumentStatus({
    id: doc.id,
    userId: doc.userId,
    status: doc.status,
    processingProgress: doc.processingProgress,
    error: doc.error,
    pageCount: doc.pageCount,
    chunkCount: doc.chunkCount,
    updatedAt: doc.updatedAt.toISOString(),
  });

  // Invalidate user's document list cache
  await invalidateCache(CACHE_KEYS.documentList(doc.userId));

  return doc;
}

/**
 * Count the total number of documents owned by a user.
 */
export async function countDocuments(userId: string): Promise<number> {
  const rows = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId));

  return rows.length;
}

/**
 * List all documents for a user, ordered by most recently created.
 * Backed by Redis cache layer with TTL (120s) and automatic invalidation.
 */
export async function listDocuments(userId: string): Promise<DocumentRecord[]> {
  const cacheKey = CACHE_KEYS.documentList(userId);
  const cached = await getCached<DocumentRecord[]>(cacheKey);
  if (cached) {
    return cached.map(normalizeDocumentDates);
  }

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));

  await setCached(cacheKey, docs, CACHE_TTL.DOCUMENTS_LIST);
  return docs;
}

/**
 * Get a single document, verifying ownership.
 * Backed by Redis cache layer with TTL (300s).
 */
export async function getDocument(userId: string, documentId: string): Promise<DocumentRecord | null> {
  const cacheKey = CACHE_KEYS.documentMeta(documentId);
  const cached = await getCached<DocumentRecord>(cacheKey);
  if (cached) {
    return cached.userId === userId ? normalizeDocumentDates(cached) : null;
  }

  const result = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
    .limit(1);

  const doc = result[0] || null;
  if (doc) {
    await setCached(cacheKey, doc, CACHE_TTL.DOCUMENT_META);
  }
  return doc;
}

/**
 * Get a document by ID without ownership check (for internal pipeline use only).
 */
export async function getDocumentById(documentId: string): Promise<DocumentRecord | null> {
  const result = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  return result[0] || null;
}

/**
 * Update document processing status, optional error, and optional metadata.
 * Performs a write-through update to Redis with TTL.
 */
export async function updateDocumentStatus(
  documentId: string,
  status: DocumentRecord["status"],
  options?: UpdateStatusOptions,
): Promise<void> {
  const payload = buildStatusUpdatePayload(status, options);
  const [updatedDoc] = await db
    .update(documents)
    .set(payload)
    .where(eq(documents.id, documentId))
    .returning();

  if (updatedDoc) {
    await setDocumentStatus({
      id: updatedDoc.id,
      userId: updatedDoc.userId,
      status: updatedDoc.status,
      processingProgress: updatedDoc.processingProgress,
      error: updatedDoc.error,
      pageCount: updatedDoc.pageCount,
      chunkCount: updatedDoc.chunkCount,
      updatedAt: updatedDoc.updatedAt.toISOString(),
    });

    await invalidateCache(
      CACHE_KEYS.documentList(updatedDoc.userId),
      CACHE_KEYS.documentMeta(documentId),
    );
  }
}

/**
 * Delete a document and cascade-clean storage, Pinecone vectors, and Redis cache.
 */
export async function deleteDocument(userId: string, documentId: string): Promise<boolean> {
  const doc = await getDocument(userId, documentId);
  if (!doc) return false;

  await cleanupDocumentStorageAndVectors(documentId, doc.fileUrl);

  await db.delete(documents).where(eq(documents.id, documentId));

  await invalidateCache(
    CACHE_KEYS.documentList(userId),
    CACHE_KEYS.documentMeta(documentId),
    CACHE_KEYS.documentStatus(documentId),
    CACHE_KEYS.favoriteDocuments(userId),
  );

  logger.info("document.deleted", { documentId, userId });
  return true;
}

/**
 * Atomic bulk deletion of all documents for a user.
 */
export async function deleteAllDocuments(userId: string): Promise<number> {
  const userDocs = await db
    .select({ id: documents.id, fileUrl: documents.fileUrl })
    .from(documents)
    .where(eq(documents.userId, userId));

  if (userDocs.length === 0) return 0;

  await cleanupAllDocumentsStorageAndVectors(userDocs, userId);
  await db.delete(documents).where(eq(documents.userId, userId));

  const metaKeys = userDocs.map((d) => CACHE_KEYS.documentMeta(d.id));
  const statusKeys = userDocs.map((d) => CACHE_KEYS.documentStatus(d.id));

  await invalidateCache(
    CACHE_KEYS.documentList(userId),
    CACHE_KEYS.favoriteDocuments(userId),
    ...metaKeys,
    ...statusKeys,
  );

  logger.info("documents.all_deleted", { userId, count: userDocs.length });
  return userDocs.length;
}

/**
 * Batch-retrieve lightweight document statuses for a user.
 */
export async function getDocumentStatuses(userId: string, documentIds: string[]): Promise<DocumentStatusDto[]> {
  if (!documentIds.length) return [];

  const { cached, missingIds } = await getDocumentStatusesPipeline(documentIds);
  const statuses: DocumentStatusDto[] = [];
  const cacheMisses: string[] = [...missingIds];

  for (const id of documentIds) {
    const item = cached[id];
    if (item) {
      if (item.userId === userId) {
        statuses.push(item);
      } else {
        cacheMisses.push(id);
      }
    }
  }

  if (cacheMisses.length > 0) {
    const uniqueMisses = Array.from(new Set(cacheMisses));
    const missingDocs = await db
      .select({
        id: documents.id,
        userId: documents.userId,
        status: documents.status,
        processingProgress: documents.processingProgress,
        error: documents.error,
        pageCount: documents.pageCount,
        chunkCount: documents.chunkCount,
        filename: documents.filename,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(and(inArray(documents.id, uniqueMisses), eq(documents.userId, userId)));

    const resolved = await Promise.all(
      missingDocs.map((d) => resolveMissingDocumentStatus(d, userId)),
    );

    statuses.push(...resolved.map((r) => r.statusDto));
  }

  return statuses;
}

/**
 * Re-trigger processing for a failed document.
 */
export async function reprocessDocument(userId: string, documentId: string): Promise<boolean> {
  const doc = await getDocument(userId, documentId);
  if (!doc) return false;

  await updateDocumentStatus(documentId, "UPLOADING", { error: null });
  await triggerProcessingWorkflow(documentId);

  logger.info("document.reprocess_triggered", { documentId, userId });
  return true;
}

async function triggerStorageWorkflow(
  documentId: string,
  userId: string,
  storagePath: string,
): Promise<{ success: boolean; documentId: string; reason?: string }> {
  try {
    await triggerProcessingWorkflow(documentId);
    logger.info("document.workflow_triggered_from_storage_webhook", {
      documentId,
      userId,
      storagePath,
    });
    return { success: true, documentId };
  } catch (err) {
    logger.error("document.workflow_trigger_failed_from_storage_webhook", {
      documentId,
      error: err instanceof Error ? err.message : String(err),
    });
    return { success: false, documentId, reason: "workflow_trigger_failed" };
  }
}

/**
 * Handle storage object inserted event (from Supabase Storage webhook).
 */
export async function handleStorageObjectCreated(
  storagePath: string,
  bucketId?: string,
): Promise<{ success: boolean; documentId?: string; reason?: string }> {
  const expectedBucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";
  if (bucketId && bucketId !== expectedBucket) {
    logger.info("document.storage_webhook_ignored_bucket", { bucketId, expectedBucket });
    return { success: false, reason: "ignored_bucket" };
  }

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.filename, storagePath))
    .limit(1);

  if (!doc) {
    logger.warn("document.storage_webhook_document_not_found", { storagePath });
    return { success: false, reason: "document_not_found" };
  }

  if (doc.status !== "UPLOADING" && doc.status !== "FAILED") {
    logger.info("document.storage_webhook_already_processing", {
      documentId: doc.id,
      status: doc.status,
      storagePath,
    });
    return { success: true, documentId: doc.id, reason: "already_processing" };
  }

  await updateDocumentStatus(doc.id, "EXTRACTING", {
    processingProgress: 10,
    error: null,
  });

  return triggerStorageWorkflow(doc.id, doc.userId, storagePath);
}

/**
 * List all favorite document IDs for a user.
 */
export async function listFavoriteDocumentIds(userId: string): Promise<string[]> {
  const cacheKey = CACHE_KEYS.favoriteDocuments(userId);
  const cached = await getCached<string[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const rows = await db
    .select({ documentId: favoriteDocuments.documentId })
    .from(favoriteDocuments)
    .where(eq(favoriteDocuments.userId, userId));

  const ids = rows.map((r) => r.documentId);
  await setCached(cacheKey, ids, CACHE_TTL.DOCUMENTS_LIST);
  return ids;
}

/**
 * Check if a document is favorited by a user.
 */
export async function isDocumentFavorite(userId: string, documentId: string): Promise<boolean> {
  const favoriteIds = await listFavoriteDocumentIds(userId);
  return favoriteIds.includes(documentId);
}

/**
 * Toggle favorite status of a document for a user.
 */
export async function toggleFavoriteDocument(
  userId: string,
  documentId: string,
): Promise<{ isFavorite: boolean }> {
  const existing = await db
    .select()
    .from(favoriteDocuments)
    .where(
      and(
        eq(favoriteDocuments.userId, userId),
        eq(favoriteDocuments.documentId, documentId),
      ),
    )
    .limit(1);

  let isFav = false;

  if (existing.length > 0) {
    await db
      .delete(favoriteDocuments)
      .where(
        and(
          eq(favoriteDocuments.userId, userId),
          eq(favoriteDocuments.documentId, documentId),
        ),
      );
    isFav = false;
  } else {
    await db.insert(favoriteDocuments).values({
      userId,
      documentId,
    });
    isFav = true;
  }

  await invalidateCache(
    CACHE_KEYS.favoriteDocuments(userId),
    CACHE_KEYS.documentList(userId),
  );

  logger.info("document.favorite_toggled", {
    documentId,
    userId,
    isFavorite: isFav,
  });

  return { isFavorite: isFav };
}
