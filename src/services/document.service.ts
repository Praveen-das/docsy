import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { deletePdf } from "@/lib/storage";
import { deleteDocumentVectors } from "@/lib/pinecone";
import { triggerProcessingWorkflow } from "@/lib/qstash";
import { logger } from "@/lib/logger";

import type { DocumentRecord, NewDocument } from "@/db/schema";

/**
 * Create a new document record in the database.
 */
export async function createDocument(
  data: NewDocument
): Promise<DocumentRecord> {
  const [doc] = await db.insert(documents).values(data).returning();

  logger.info("document.uploaded", {
    documentId: doc.id,
    userId: doc.userId,
    filename: doc.originalName,
    fileSize: doc.fileSize,
  });

  return doc;
}

/**
 * List all documents for a user, ordered by most recently created.
 * All queries are scoped to userId for ownership enforcement (PRD §28).
 */
export async function listDocuments(
  userId: string
): Promise<DocumentRecord[]> {
  return db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));
}

/**
 * Get a single document, verifying ownership.
 * Returns null if document doesn't exist or belongs to another user.
 */
export async function getDocument(
  userId: string,
  documentId: string
): Promise<DocumentRecord | null> {
  const result = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
    .limit(1);

  return result[0] || null;
}

/**
 * Get a document by ID without ownership check (for internal pipeline use only).
 */
export async function getDocumentById(
  documentId: string
): Promise<DocumentRecord | null> {
  const result = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  return result[0] || null;
}

export interface UpdateStatusOptions {
  error?: string | null;
  metadata?: { pageCount?: number; chunkCount?: number };
}

/**
 * Update document processing status, optional error, and optional metadata.
 */
export async function updateDocumentStatus(
  documentId: string,
  status: DocumentRecord["status"],
  options?: UpdateStatusOptions
): Promise<void> {
  await db
    .update(documents)
    .set({
      status,
      ...(options?.error !== undefined && { error: options.error }),
      ...(options?.metadata?.pageCount !== undefined && { pageCount: options.metadata.pageCount }),
      ...(options?.metadata?.chunkCount !== undefined && { chunkCount: options.metadata.chunkCount }),
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId));
}

/**
 * Update document metadata after processing (page count, chunk count).
 */
export async function updateDocumentMetadata(
  documentId: string,
  data: { pageCount?: number; chunkCount?: number }
): Promise<void> {
  await db
    .update(documents)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId));
}

/**
 * Delete a document and cascade-clean storage and Pinecone vectors.
 * PRD §10 FR-06: Remove DB record, storage file, and Pinecone vectors.
 */
export async function deleteDocument(
  userId: string,
  documentId: string
): Promise<boolean> {
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
    await deleteDocumentVectors(userId, documentId);
  } catch (err) {
    logger.warn("document.vector_delete_failed", {
      documentId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Delete DB record (cascades to conversation_documents)
  await db.delete(documents).where(eq(documents.id, documentId));

  logger.info("document.deleted", { documentId, userId });
  return true;
}

/**
 * Re-trigger processing for a failed document.
 */
export async function reprocessDocument(
  userId: string,
  documentId: string
): Promise<boolean> {
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
    const match = url.pathname.match(
      /\/storage\/v1\/object\/public\/[^/]+\/(.+)/
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
