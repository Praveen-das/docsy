/**
 * Document processing utilities.
 *
 * The orchestration logic that previously lived in `processDocument()` has been
 * moved into the Upstash Workflow route (`app/api/workflows/process-document/route.ts`)
 * which uses durable `context.run()` steps for checkpointed execution.
 *
 * This module now only re-exports the individual pipeline functions and shared
 * utilities consumed by the workflow.
 */

// Re-export pipeline functions for convenience
export { downloadPdf } from "@/lib/storage";
export { extractTextFromPdf } from "@/lib/pdf-parser";
export { chunkText, type TextChunk } from "@/lib/chunking";
export { embedDocuments } from "@/lib/embeddings";
export { upsertVectors, type VectorRecord } from "@/lib/pinecone";

/**
 * Extract the storage file path from a Supabase public URL.
 * Supabase URLs: /storage/v1/object/public/{bucket}/{path}
 */
export function extractFilePathFromUrl(fileUrl: string): string | null {
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
