import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deletePdf, deletePdfs, verifyFileExists } from "@/lib/storage";
import { deleteDocumentVectors } from "@/lib/pinecone";
import { triggerProcessingWorkflow } from "@/lib/workflow";
import { logger } from "@/lib/logger";
import { invalidateCache } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache-keys";
import type { DocumentRecord } from "@/db/schema";
import type { DocumentStatusDto } from "@/types";

export interface UpdateStatusOptions {
  error?: string | null;
  processingProgress?: number;
  metadata?: { pageCount?: number; chunkCount?: number };
}

export function buildStatusUpdatePayload(
  status: DocumentRecord["status"],
  options?: UpdateStatusOptions,
): Partial<DocumentRecord> {
  const payload: Partial<DocumentRecord> = {
    status,
    updatedAt: new Date(),
  };

  if (options?.processingProgress !== undefined) {
    payload.processingProgress = options.processingProgress;
  }
  if (options?.error !== undefined) {
    payload.error = options.error;
  }
  if (options?.metadata?.pageCount !== undefined) {
    payload.pageCount = options.metadata.pageCount;
  }
  if (options?.metadata?.chunkCount !== undefined) {
    payload.chunkCount = options.metadata.chunkCount;
  }

  return payload;
}

function extractFilePathFromUrl(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const match = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function cleanupDocumentStorageAndVectors(documentId: string, fileUrl: string) {
  try {
    const filePath = extractFilePathFromUrl(fileUrl);
    if (filePath) {
      await deletePdf(filePath);
    }
  } catch (err) {
    logger.warn("document.storage_delete_failed", {
      documentId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  try {
    await deleteDocumentVectors(documentId);
  } catch (err) {
    logger.warn("document.vector_delete_failed", {
      documentId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function cleanupAllDocumentsStorageAndVectors(docs: { id: string; fileUrl: string }[], userId: string) {
  const filePaths = docs.map((d) => extractFilePathFromUrl(d.fileUrl)).filter((p): p is string => Boolean(p));

  if (filePaths.length > 0) {
    try {
      await deletePdfs(filePaths);
    } catch (err) {
      logger.warn("documents.bulk_storage_delete_failed", {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  await Promise.allSettled(
    docs.map((d) =>
      deleteDocumentVectors(d.id).catch((err) =>
        logger.warn("documents.bulk_vector_delete_failed", {
          documentId: d.id,
          error: String(err),
        }),
      ),
    ),
  );
}

export async function resolveMissingDocumentStatus(
  d: Pick<
    DocumentRecord,
    "id" | "userId" | "status" | "processingProgress" | "error" | "pageCount" | "chunkCount" | "filename" | "updatedAt"
  >,
  userId: string,
): Promise<{ statusDto: DocumentStatusDto; shouldPipeline: boolean }> {
  const fileExists = await verifyFileExists(d.filename);

  if (fileExists) {
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

    return { statusDto: item, shouldPipeline: true };
  }

  const failureReason = "Upload failed: file not found in storage. Please re-upload.";
  const now = new Date();

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

  await invalidateCache(
    CACHE_KEYS.documentStatus(d.id),
    CACHE_KEYS.documentMeta(d.id),
    CACHE_KEYS.documentList(userId),
  );

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

  return { statusDto: item, shouldPipeline: false };
}
