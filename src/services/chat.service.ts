import { persistMessage } from "@/services/conversation.service";
import { incrementQueryCount, getUserProfile } from "@/services/user.service";
import { executeRAG, type RAGResult } from "@/services/rag.service";
import { verifyConversationToken } from "@/lib/conversation-token";
import { timeOperation } from "@/lib/profiler";
import { logger } from "@/lib/logger";
import type { HistoryMessage } from "@/lib/validations/chat.schema";

export type ChatPreflightResult =
  | {
      success: true;
      documentIds: string[];
      isFastPath: true;
    }
  | {
      success: false;
      error: "UNAUTHORIZED" | "QUOTA_EXCEEDED";
    };

export interface VerifyChatPreflightParams {
  userId: string;
  conversationId: string;
  incomingToken?: string | null;
}

/**
 * Preflight verification for the streaming chat pipeline:
 * Requires a valid, cryptographically signed conversation capability token.
 * If the token is absent, tampered, or expired, access is strictly unauthorized (zero DB lookups).
 */
export async function verifyChatPreflight({
  userId,
  conversationId,
  incomingToken,
}: VerifyChatPreflightParams): Promise<ChatPreflightResult> {
  // 1. Strict Authorization: Reject immediately if token is missing
  if (!incomingToken) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  // 2. In-memory cryptographic verification (<0.05ms)
  const tokenPayload = await timeOperation("conv", () =>
    verifyConversationToken(incomingToken)
  );

  // 3. Verify user ownership and conversation ID match
  if (
    !tokenPayload ||
    tokenPayload.userId !== userId ||
    tokenPayload.conversationId !== conversationId
  ) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  // 4. Daily query quota check (only operation hitting Redis)
  const quotaAllowed = await timeOperation("quota", () =>
    incrementQueryCount(userId)
  );

  if (!quotaAllowed) {
    return { success: false, error: "QUOTA_EXCEEDED" };
  }

  return {
    success: true,
    documentIds: tokenPayload.documentIds,
    isFastPath: true,
  };
}

export interface DispatchChatPipelineParams {
  userId: string;
  conversationId: string;
  content: string;
  documentIds: string[];
  conversationHistory?: HistoryMessage[];
  skipUserPersistence?: boolean;
  customPrompt?: string;
}

export interface ChatPipelineResult {
  ragResult: RAGResult;
  persistUserPromise: Promise<unknown>;
}

/**
 * Dispatches non-blocking user message persistence and executes the RAG retrieval pipeline.
 */
export async function dispatchChatPipeline({
  userId,
  conversationId,
  content,
  documentIds,
  conversationHistory,
  skipUserPersistence = false,
  customPrompt,
}: DispatchChatPipelineParams): Promise<ChatPipelineResult> {
  // Fire-and-forget user message persistence in background if not explicitly skipped
  const persistUserPromise = skipUserPersistence
    ? Promise.resolve(null)
    : timeOperation("persist", async () =>
        persistMessage({
          conversationId,
          role: "user",
          content,
        }).catch((err) => {
          logger.error("chat.user_message_persist_failed", {
            userId,
            conversationId,
            error: err instanceof Error ? err.message : String(err),
          });
          return null;
        })
      );

  // Resolve active custom prompt from params or fallback to user profile in DB/cache
  let activeCustomPrompt = customPrompt;
  if (!activeCustomPrompt) {
    const profile = await getUserProfile(userId);
    activeCustomPrompt = profile?.customPrompt || undefined;
  }

  // Execute RAG pipeline using verified document IDs from token
  const ragResult = await timeOperation("rag", () =>
    executeRAG(userId, content, documentIds, conversationHistory, 5, activeCustomPrompt)
  );

  return {
    ragResult,
    persistUserPromise,
  };
}
