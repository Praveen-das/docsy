import { embedQuery } from "@/lib/embeddings";
import { queryVectors, type VectorMetadata } from "@/lib/pinecone";
import { buildContextBlock, buildPromptMessages } from "@/lib/prompt-templates";
import { getDocumentById } from "./document.service";
import { logger } from "@/lib/logger";

export interface RetrievedSource {
  documentId: string;
  documentName: string;
  page: number;
  chunkIndex: number;
  textSnippet: string;
  relevanceScore: number;
}

export interface RAGResult {
  contextBlock: string;
  sources: RetrievedSource[];
  promptMessages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
}

/**
 * Full RAG pipeline: embed query → Pinecone retrieval → context construction → prompt assembly.
 *
 * @param userId - Authenticated user ID (for Pinecone namespace isolation)
 * @param query - User's question
 * @param documentIds - Documents linked to the current conversation (scoped retrieval)
 * @param conversationHistory - Recent messages for multi-turn context
 * @param topK - Number of chunks to retrieve (default 5 per PRD §17)
 */
export async function executeRAG(
  userId: string,
  query: string,
  documentIds: string[],
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
  topK = 5
): Promise<RAGResult> {
  logger.info("rag.started", {
    userId,
    documentIds,
    queryLength: query.length,
    topK,
  });

  // Step 1: Embed the query
  const queryVector = await embedQuery(query);

  // Step 2: Search Pinecone with document scoping (PRD §17 FR-15)
  const matches = await queryVectors(userId, queryVector, documentIds, topK);

  // Step 3: Enrich matches with document names for citations
  const sources: RetrievedSource[] = [];
  const contextChunks: Array<{
    documentName: string;
    page: number;
    text: string;
    score: number;
  }> = [];

  for (const match of matches) {
    const meta = match.metadata;
    // Look up document name
    const doc = await getDocumentById(meta.documentId);
    const documentName = doc?.originalName || "Unknown Document";

    sources.push({
      documentId: meta.documentId,
      documentName,
      page: meta.page,
      chunkIndex: meta.chunkIndex,
      textSnippet: meta.textSnippet,
      relevanceScore: match.score,
    });

    contextChunks.push({
      documentName,
      page: meta.page,
      text: meta.textSnippet,
      score: match.score,
    });
  }

  // Step 4: Build context block and prompt messages
  const contextBlock = buildContextBlock(contextChunks);
  const promptMessages = buildPromptMessages(
    contextBlock,
    conversationHistory,
    query
  );

  logger.info("rag.completed", {
    userId,
    matchCount: matches.length,
    topScore: matches[0]?.score ?? 0,
  });

  return {
    contextBlock,
    sources,
    promptMessages,
  };
}
