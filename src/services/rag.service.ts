import { embedQuery } from "@/lib/embeddings";
import { queryVectors } from "@/lib/pinecone";
import { buildContextBlock, buildSystemPrompt, buildPromptMessages } from "@/lib/prompt-templates";
import { logger } from "@/lib/logger";

export interface RAGResult {
  contextBlock: string;
  systemPrompt: string;
  promptMessages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

/**
 * Full RAG pipeline: embed query → Pinecone retrieval → context construction → prompt assembly.
 *
 * @param userId - Authenticated user ID (for logging/auditing)
 * @param query - User's question
 * @param documentIdOrIds - Document ID (or array) linked to the current conversation
 * @param conversationHistory - Recent messages for multi-turn context
 * @param topK - Number of chunks to retrieve (default 5 per PRD §17)
 */
export async function executeRAG(
  userId: string,
  query: string,
  documentIdOrIds: string | string[],
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [],
  topK = 5,
  customPrompt?: string,
): Promise<RAGResult> {
  const documentId = Array.isArray(documentIdOrIds) ? documentIdOrIds[0] : documentIdOrIds;

  logger.info("rag.started", {
    userId,
    documentId,
    queryLength: query.length,
    topK,
  });

  if (!documentId) {
    logger.warn("rag.no_document_provided", { userId });
    return {
      contextBlock: "",
      systemPrompt: buildSystemPrompt("", customPrompt),
      promptMessages: buildPromptMessages(conversationHistory, query),
    };
  }

  // Step 1: Embed the query
  console.time("\x1b[1;96m🧠 [Embed the query]\x1b[0m");
  const queryVector = await embedQuery(query);
  console.timeEnd("\x1b[1;96m🧠 [Embed the query]\x1b[0m");

  // Step 2: Search Pinecone scoped to the document namespace
  console.time("\x1b[1;96m🧠 [Search Pinecone]\x1b[0m");
  const matches = await queryVectors(documentId, queryVector, topK);
  console.timeEnd("\x1b[1;96m🧠 [Search Pinecone]\x1b[0m");

  // Step 3: Extract context chunks directly from matches (zero DB lookups required)
  const contextChunks = matches.map((match) => ({
    text: match.metadata.textSnippet,
    score: match.score,
  }));

  // Step 4: Build context block, system instructions, and chat messages
  const contextBlock = buildContextBlock(contextChunks);
  const systemPrompt = buildSystemPrompt(contextBlock, customPrompt);
  const promptMessages = buildPromptMessages(conversationHistory, query);

  logger.info("rag.completed", {
    userId,
    documentId,
    matchCount: matches.length,
    topScore: matches[0]?.score ?? 0,
  });

  return {
    contextBlock,
    systemPrompt,
    promptMessages,
  };
}
