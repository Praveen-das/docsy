import { serve } from "@upstash/workflow/nextjs";
import { downloadPdf } from "@/lib/storage";
import { extractTextFromPdf } from "@/lib/pdf-parser";
import { chunkText } from "@/lib/chunking";
import { embedDocuments } from "@/lib/embeddings";
import { upsertVectors, type VectorRecord } from "@/lib/pinecone";
import {
  getDocumentById,
  updateDocumentStatus,
} from "@/services/document.service";
import { logger } from "@/lib/logger";

type ProcessDocumentPayload = { documentId: string };

/**
 * POST /api/workflows/process-document
 *
 * Upstash Workflow endpoint for durable document processing.
 * Each pipeline phase is a checkpointed step — if a step succeeds,
 * it won't re-execute on retry. `serve()` handles QStash signature
 * verification automatically.
 */
export const { POST } = serve<ProcessDocumentPayload>(
  async (context) => {
    const { documentId } = context.requestPayload;

    // Step 1: Validate document exists and retrieve metadata
    const doc = await context.run("validate-document", async () => {
      const d = await getDocumentById(documentId);
      if (!d) throw new Error(`Document ${documentId} not found`);
      return { userId: d.userId, fileUrl: d.fileUrl };
    });

    // Step 2: Download and extract text from PDF
    const pages = await context.run("extract-text", async () => {
      const filePath = extractFilePathFromUrl(doc.fileUrl);
      if (!filePath) {
        throw new Error("Invalid file URL — cannot determine storage path");
      }

      const pdfBuffer = await downloadPdf(filePath);
      const result = await extractTextFromPdf(pdfBuffer);

      await updateDocumentStatus(documentId, "EXTRACTING", {
        metadata: { pageCount: result.length },
      });

      logger.info("document.processing.extracted", {
        documentId,
        pageCount: result.length,
      });

      return result;
    });

    // Step 3: Split text into chunks
    const chunks = await context.run("chunk-text", async () => {
      const result = await chunkText(pages, documentId, doc.userId);

      await updateDocumentStatus(documentId, "CHUNKING", {
        metadata: { chunkCount: result.length },
      });

      logger.info("document.processing.chunked", {
        documentId,
        chunkCount: result.length,
      });

      return result;
    });

    // Step 4: Generate embeddings (batched to avoid rate limits)
    const allEmbeddings = await context.run(
      "generate-embeddings",
      async () => {
        const BATCH_SIZE = 100;
        const chunkTexts = chunks.map((c) => c.text);
        const embeddings: number[][] = [];

        for (let i = 0; i < chunkTexts.length; i += BATCH_SIZE) {
          const batch = chunkTexts.slice(i, i + BATCH_SIZE);
          const batchEmbeddings = await embedDocuments(batch);
          embeddings.push(...batchEmbeddings);
        }

        await updateDocumentStatus(documentId, "EMBEDDING");

        logger.info("document.processing.embedded", {
          documentId,
          embeddingCount: embeddings.length,
        });

        return embeddings;
      },
    );

    // Step 5: Upsert vectors to Pinecone
    await context.run("upsert-vectors", async () => {
      const vectors: VectorRecord[] = chunks.map((chunk, i) => ({
        id: `${documentId}-chunk-${chunk.chunkIndex}`,
        values: allEmbeddings[i],
        metadata: {
          documentId: chunk.documentId,
          page: chunk.page,
          chunkIndex: chunk.chunkIndex,
          textSnippet: chunk.text.slice(0, 200),
        },
      }));

      await upsertVectors(doc.userId, vectors);
      await updateDocumentStatus(documentId, "INDEXING");

      logger.info("document.processing.indexed", {
        documentId,
        vectorCount: vectors.length,
      });
    });

    // Step 6: Mark document as ready
    await context.run("finalize", async () => {
      await updateDocumentStatus(documentId, "READY");

      logger.info("document.processing.completed", {
        documentId,
        userId: doc.userId,
      });
    });
  },
  {
    failureFunction: async ({ context, failStatus, failResponse }) => {
      const { documentId } = context.requestPayload;
      const errorMessage =
        failResponse ?? `Workflow failed with status ${failStatus}`;

      logger.error("document.processing.failed", {
        documentId,
        error:
          typeof errorMessage === "string"
            ? errorMessage
            : String(errorMessage),
      });

      await updateDocumentStatus(documentId, "FAILED", {
        error:
          typeof errorMessage === "string"
            ? errorMessage
            : String(errorMessage),
      });
    },
  },
);

/**
 * Extract the storage file path from a Supabase public URL.
 */
function extractFilePathFromUrl(fileUrl: string): string | null {
  try {
    const url = new URL(fileUrl);
    const match = url.pathname.match(
      /\/storage\/v1\/object\/public\/[^/]+\/(.+)/,
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
