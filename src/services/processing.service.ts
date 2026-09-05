import { downloadPdf } from "@/lib/storage";
import { extractTextFromPdf } from "@/lib/pdf-parser";
import { chunkText } from "@/lib/chunking";
import { embedDocuments } from "@/lib/embeddings";
import { upsertVectors, type VectorRecord } from "@/lib/pinecone";
import {
  getDocumentById,
  updateDocumentStatus,
} from "./document.service";
import { logger } from "@/lib/logger";

/**
 * Full document processing pipeline.
 * State machine: UPLOADING → EXTRACTING → CHUNKING → EMBEDDING → INDEXING → READY | FAILED
 *
 * Called by the QStash webhook endpoint. Each stage updates the DB status
 * so the frontend can poll and display real progress.
 */
export async function processDocument(documentId: string): Promise<void> {
  const doc = await getDocumentById(documentId);
  if (!doc) {
    throw new Error(`Document ${documentId} not found`);
  }

  const { userId, fileUrl } = doc;

  logger.info("document.processing.started", { documentId, userId });

  try {
    // Extract file path from Supabase URL
    const filePath = extractFilePathFromUrl(fileUrl);
    if (!filePath) {
      throw new Error("Invalid file URL — cannot determine storage path");
    }

    // --- Phase 1: EXTRACTING ---
    const pdfBuffer = await downloadPdf(filePath);
    const pages = await extractTextFromPdf(pdfBuffer);

    await updateDocumentStatus(documentId, "EXTRACTING", {
      metadata: { pageCount: pages.length },
    });

    logger.info("document.processing.extracted", {
      documentId,
      pageCount: pages.length,
    });

    // --- Phase 2: CHUNKING ---
    const chunks = await chunkText(pages, documentId, userId);

    await updateDocumentStatus(documentId, "CHUNKING", {
      metadata: { chunkCount: chunks.length },
    });

    logger.info("document.processing.chunked", {
      documentId,
      chunkCount: chunks.length,
    });

    // --- Phase 3: EMBEDDING ---
    const chunkTexts = chunks.map((c) => c.text);

    // Batch embed in groups of 100 to avoid rate limits
    const EMBED_BATCH_SIZE = 100;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < chunkTexts.length; i += EMBED_BATCH_SIZE) {
      const batch = chunkTexts.slice(i, i + EMBED_BATCH_SIZE);
      const batchEmbeddings = await embedDocuments(batch);
      allEmbeddings.push(...batchEmbeddings);
    }

    await updateDocumentStatus(documentId, "EMBEDDING");

    logger.info("document.processing.embedded", {
      documentId,
      embeddingCount: allEmbeddings.length,
    });

    // --- Phase 4: INDEXING ---
    const vectors: VectorRecord[] = chunks.map((chunk, i) => ({
      id: `${documentId}-chunk-${chunk.chunkIndex}`,
      values: allEmbeddings[i],
      metadata: {
        documentId: chunk.documentId,
        page: chunk.page,
        chunkIndex: chunk.chunkIndex,
        textSnippet: chunk.text.slice(0, 200), // First 200 chars for citation preview
      },
    }));

    await upsertVectors(userId, vectors);

    await updateDocumentStatus(documentId, "INDEXING");

    logger.info("document.processing.indexed", {
      documentId,
      vectorCount: vectors.length,
    });

    // --- Phase 5: READY ---
    await updateDocumentStatus(documentId, "READY");

    logger.info("document.processing.completed", {
      documentId,
      userId,
      pageCount: pages.length,
      chunkCount: chunks.length,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected error occurred during processing";

    logger.error("document.processing.failed", {
      documentId,
      userId,
      error: errorMessage,
    });

    await updateDocumentStatus(documentId, "FAILED", { error: errorMessage });

    throw err; // Re-throw so QStash can retry on transient errors
  }
}

/**
 * Extract the storage file path from a Supabase public URL.
 */
function extractFilePathFromUrl(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const match = url.pathname.match(
      /\/storage\/v1\/object\/public\/[^/]+\/(.+)/
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
