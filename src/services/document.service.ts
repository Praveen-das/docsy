import { db } from "@/db";
import { documents, favoriteDocuments } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { deletePdf, verifyFileExists } from "@/lib/storage";
import { deleteDocumentVectors } from "@/lib/pinecone";
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

import type { DocumentRecord, NewDocument } from "@/db/schema";
import type { DocumentStatusDto } from "@/types";

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
 * Used to enforce per-plan document limits before allowing a new upload.
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

  const docs = await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));

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
    if (cached.userId === userId) {
      return normalizeDocumentDates(cached);
    }
    return null;
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

export interface UpdateStatusOptions {
  error?: string | null;
  processingProgress?: number;
  metadata?: { pageCount?: number; chunkCount?: number };
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
  const [updatedDoc] = await db
    .update(documents)
    .set({
      status,
      ...(options?.processingProgress !== undefined && {
        processingProgress: options.processingProgress,
      }),
      ...(options?.error !== undefined && { error: options.error }),
      ...(options?.metadata?.pageCount !== undefined && { pageCount: options.metadata.pageCount }),
      ...(options?.metadata?.chunkCount !== undefined && { chunkCount: options.metadata.chunkCount }),
      updatedAt: new Date(),
    })
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

    // Invalidate document list and metadata caches
    await invalidateCache(CACHE_KEYS.documentList(updatedDoc.userId), CACHE_KEYS.documentMeta(documentId));
  }
}

/**
 * Update document metadata after processing (page count, chunk count).
 */
export async function updateDocumentMetadata(
  documentId: string,
  data: { pageCount?: number; chunkCount?: number },
): Promise<void> {
  const [updatedDoc] = await db
    .update(documents)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId))
    .returning();

  if (updatedDoc) {
    await invalidateCache(CACHE_KEYS.documentList(updatedDoc.userId), CACHE_KEYS.documentMeta(documentId));
  }
}

/**
 * Delete a document and cascade-clean storage, Pinecone vectors, and Redis cache.
 * PRD §10 FR-06: Remove DB record, storage file, and Pinecone vectors.
 */
export async function deleteDocument(userId: string, documentId: string): Promise<boolean> {
  const doc = await getDocument(userId, documentId);
  if (!doc) return false;

  // Clean up storage (non-fatal — log and continue)
  try {
    // Extract file path from URL
    const filePath = extractFilePathFromUrl(doc.fileUrl);
    if (filePath) {
      await deletePdf(filePath);
    }
  } catch (err) {
    logger.warn("document.storage_delete_failed", {
      documentId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Clean up Pinecone vectors (non-fatal — log and continue)
  try {
    await deleteDocumentVectors(documentId);
  } catch (err) {
    logger.warn("document.vector_delete_failed", {
      documentId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Delete DB record (cascades to conversation_documents)
  await db.delete(documents).where(eq(documents.id, documentId));

  // Invalidate Redis status, metadata, list, and favorite caches
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
 * Batch-retrieve lightweight document statuses for a user.
 * 1. Checks Upstash Redis using a pipeline for all documentIds in a single round-trip.
 * 2. On cache misses, queries PostgreSQL for the missing document records.
 * 3. Batches cache-miss writes back into Redis using a pipeline with TTL.
 * 4. Ensures ownership verification (never exposes documents across users).
 */
export async function getDocumentStatuses(userId: string, documentIds: string[]): Promise<DocumentStatusDto[]> {
  if (!documentIds.length) return [];

  // 1. Batch read from Redis via pipeline
  const { cached, missingIds } = await getDocumentStatusesPipeline(documentIds);

  const statuses: DocumentStatusDto[] = [];
  const cacheMisses: string[] = [...missingIds];

  // Verify ownership of cached items
  for (const id of documentIds) {
    const item = cached[id];
    if (item) {
      if (item.userId === userId) {
        statuses.push(item);
      } else {
        // Mismatched owner, re-verify against DB
        cacheMisses.push(id);
      }
    }
  }

  // 2. Fetch cache misses from database in a single query
  // if (cacheMisses.length > 0) {
  if (true) {
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

    const docsToPipeline: DocumentStatusDto[] = [];
    const resolvedStatuses: DocumentStatusDto[] = [];

    await Promise.all(
      missingDocs.map(async (d) => {
        // Cache miss on an in-flight / non-terminal document (e.g. UPLOADING, EXTRACTING):
        // Verify whether the file actually exists in storage
        const fileExists = await verifyFileExists(d.filename);

        if (fileExists) {
          // File exists in storage: re-trigger the document processing workflow
          try {
            await triggerProcessingWorkflow(d.id);
            logger.info("document.workflow_retriggered_from_polling", {
              documentId: d.id,
              userId: d.userId,
            });
          } catch (workflowErr) {
            logger.error("document.workflow_retrigger_failed", {
              documentId: d.id,
              userId: d.userId,
              error: workflowErr instanceof Error ? workflowErr.message : String(workflowErr),
            });
          }

          // Advance status from UPLOADING to EXTRACTING (or retain active stage)
          const nextStatus = d.status === "UPLOADING" ? "EXTRACTING" : d.status;
          const nextProgress = Math.max(d.processingProgress, 10);
          const now = new Date();

          await db
            .update(documents)
            .set({
              status: nextStatus,
              processingProgress: nextProgress,
              error: null,
              updatedAt: now,
            })
            .where(eq(documents.id, d.id));

          const item: DocumentStatusDto = {
            id: d.id,
            userId: d.userId,
            status: nextStatus,
            processingProgress: nextProgress,
            error: null,
            pageCount: d.pageCount,
            chunkCount: d.chunkCount,
            updatedAt: now.toISOString(),
          };

          docsToPipeline.push(item);
          resolvedStatuses.push(item);
        } else {
          // File does NOT exist in storage (e.g. broken network during direct client upload)
          const failureReason = "Upload failed: file not found in storage. Please re-upload.";
          const now = new Date();

          // 1. Mark metadata in the DB using appropriate status
          await db
            .update(documents)
            .set({
              status: "FAILED",
              error: failureReason,
              processingProgress: 0,
              updatedAt: now,
            })
            .where(eq(documents.id, d.id));

          logger.warn("document.upload_incomplete_marked_failed", {
            documentId: d.id,
            userId: d.userId,
            filename: d.filename,
          });

          // 2. Invalidate cache across all scopes
          await invalidateCache(
            CACHE_KEYS.documentStatus(d.id),
            CACHE_KEYS.documentMeta(d.id),
            CACHE_KEYS.documentList(userId),
          );

          // 3. Build appropriate response back to the client
          const item: DocumentStatusDto = {
            id: d.id,
            userId: d.userId,
            status: "FAILED",
            processingProgress: 0,
            error: failureReason,
            pageCount: d.pageCount,
            chunkCount: d.chunkCount,
            updatedAt: now.toISOString(),
          };

          resolvedStatuses.push(item);
        }
      }),
    );

    // 3. Batch write valid in-flight/ready statuses to Redis with pipeline
    if (docsToPipeline.length > 0) {
      // await setDocumentStatusesPipeline(docsToPipeline);
    }

    statuses.push(...resolvedStatuses);
  }

  return statuses;
}

/**
 * Re-trigger processing for a failed document.
 */
export async function reprocessDocument(userId: string, documentId: string): Promise<boolean> {
  const doc = await getDocument(userId, documentId);
  if (!doc) return false;

  // Reset status and dispatch new processing job
  await updateDocumentStatus(documentId, "UPLOADING", { error: null });
  await triggerProcessingWorkflow(documentId);

  logger.info("document.reprocess_triggered", { documentId, userId });
  return true;
}

/**
 * Extract the storage file path from a Supabase public URL.
 */
function extractFilePathFromUrl(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    // Supabase URLs: /storage/v1/object/public/{bucket}/{path}
    const match = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Handle storage object inserted event (from Supabase Storage webhook).
 * Automatically triggers the document processing pipeline on the server.
 */
export async function handleStorageObjectCreated(
  storagePath: string,
  bucketId?: string,
): Promise<{ success: boolean; documentId?: string; reason?: string }> {
  const expectedBucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";
  if (bucketId && bucketId !== expectedBucket) {
    logger.info("document.storage_webhook_ignored_bucket", {
      bucketId,
      expectedBucket,
    });
    return { success: false, reason: "ignored_bucket" };
  }

  // Find document by filename (which stores the relative storage path: userId/file.pdf)
  const [doc] = await db.select().from(documents).where(eq(documents.filename, storagePath)).limit(1);

  if (!doc) {
    logger.warn("document.storage_webhook_document_not_found", { storagePath });
    return { success: false, reason: "document_not_found" };
  }

  // If already processing or completed, avoid duplicate triggers (idempotent)
  if (doc.status !== "UPLOADING" && doc.status !== "FAILED") {
    logger.info("document.storage_webhook_already_processing", {
      documentId: doc.id,
      status: doc.status,
      storagePath,
    });
    return { success: true, documentId: doc.id, reason: "already_processing" };
  }

  // Advance status to EXTRACTING with initial progress
  await updateDocumentStatus(doc.id, "EXTRACTING", {
    processingProgress: 10,
    error: null,
  });

  // Trigger processing workflow via QStash
  try {
    await triggerProcessingWorkflow(doc.id);
    logger.info("document.workflow_triggered_from_storage_webhook", {
      documentId: doc.id,
      userId: doc.userId,
      storagePath,
    });
    return { success: true, documentId: doc.id };
  } catch (err) {
    logger.error("document.workflow_trigger_failed_from_storage_webhook", {
      documentId: doc.id,
      error: err instanceof Error ? err.message : String(err),
    });
    return { success: false, documentId: doc.id, reason: "workflow_trigger_failed" };
  }
}

/**
 * List all favorite document IDs for a user.
 * Cached in Redis with TTL (120s).
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
 * Invalidates user's favorite document cache and document list cache.
 */
export async function toggleFavoriteDocument(
  userId: string,
  documentId: string
): Promise<{ isFavorite: boolean }> {
  // Check whether favorite record currently exists
  const existing = await db
    .select()
    .from(favoriteDocuments)
    .where(
      and(
        eq(favoriteDocuments.userId, userId),
        eq(favoriteDocuments.documentId, documentId)
      )
    )
    .limit(1);

  let isFav = false;

  if (existing.length > 0) {
    // Remove from favorites
    await db
      .delete(favoriteDocuments)
      .where(
        and(
          eq(favoriteDocuments.userId, userId),
          eq(favoriteDocuments.documentId, documentId)
        )
      );
    isFav = false;
  } else {
    // Add to favorites
    await db.insert(favoriteDocuments).values({
      userId,
      documentId,
    });
    isFav = true;
  }

  // Invalidate Redis caches
  await invalidateCache(
    CACHE_KEYS.favoriteDocuments(userId),
    CACHE_KEYS.documentList(userId)
  );

  logger.info("document.favorite_toggled", {
    documentId,
    userId,
    isFavorite: isFav,
  });

  return { isFavorite: isFav };
}

