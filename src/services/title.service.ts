import { generateText } from "ai";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { getTitleModel } from "@/lib/ai";
import { logger } from "@/lib/logger";
import { invalidateCache } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache-keys";
import { isDefaultTitle, generateFallbackTitle } from "@/lib/title-utils";

export { isDefaultTitle, generateFallbackTitle };

/**
 * Cleans and sanitizes raw model output into a clean, concise title suitable for UI sidebars.
 */
export function sanitizeTitle(rawText: string, fallback: string): string {
  if (!rawText || !rawText.trim()) {
    return fallback;
  }

  let cleaned = rawText.trim();

  // Remove common AI prefix chatter
  cleaned = cleaned.replace(/^(title|summary|conversation title|topic):\s*/i, "");

  // Remove wrapping quotes and backticks
  cleaned = cleaned.replace(/^["'`“«\s]+|["'`”»\s]+$/g, "");

  // Remove markdown formatting
  cleaned = cleaned.replace(/[*_#`~]/g, "");

  // Remove trailing sentence punctuation
  cleaned = cleaned.replace(/[.,:;!?]+$/g, "").trim();

  if (!cleaned) {
    return fallback;
  }

  // Cap at 45 characters maximum to prevent sidebar layout overflow
  if (cleaned.length > 45) {
    const truncated = cleaned.slice(0, 42).trim();
    return `${truncated}...`;
  }

  return cleaned;
}

/**
 * Model prompt tuned for intelligent, ChatGPT-style conversation categorization and titling.
 */
const TITLE_SYSTEM_PROMPT = `You are a conversation title generator. Your task is to generate a concise, informative title (2 to 4 words) that summarizes the topic, intent, or primary subject of the conversation.

Instructions:
- Identify the user's intent or primary topic.
- For greetings, casual openers, or pleasantries without a specific subject (e.g. "hi", "hello", "hey"), title the conversation based on the intent (e.g. "Greeting exchange" or "Casual conversation") rather than repeating the words spoken.
- For topical questions, identify the core subject (e.g. "Python Redis Latency", "Contract Terms Overview", "Invoice Due Date").
- Output ONLY the plain title text. Do not wrap in quotes. Do not add punctuation.`;

/**
 * Generates an intelligent conversation title using a fast language model.
 */
export async function generateConversationTitle(userMessage: string, assistantMessage?: string): Promise<string> {
  const fallback = generateFallbackTitle(userMessage);

  try {
    const userPromptSlice = userMessage.slice(0, 600).trim();
    const assistantSlice = assistantMessage ? assistantMessage.slice(0, 400).trim() : "";

    const promptContext = assistantSlice
      ? `User: ${userPromptSlice}\nAssistant: ${assistantSlice}`
      : `User: ${userPromptSlice}`;

    const model = getTitleModel();

    logger.info("title.generating", { promptContext });

    const { text } = await generateText({
      model,
      system: TITLE_SYSTEM_PROMPT,
      prompt: promptContext,
      temperature: 0.2, // Low temperature for focused, deterministic title generation
    });

    return sanitizeTitle(text, fallback);
  } catch (error) {
    logger.error("title.generation_failed_using_fallback", {
      error: error instanceof Error ? error.message : String(error),
      fallback,
    });
    return fallback;
  }
}

export interface UpdateTitleOptions {
  conversationId: string;
  userId: string;
  userMessage: string;
  assistantMessage?: string;
}

/**
 * Asynchronously generates and updates the conversation title using the initial chat.
 */
export async function updateConversationTitleIfDefault({
  conversationId,
  userId,
  userMessage,
  assistantMessage,
}: UpdateTitleOptions): Promise<string | null> {
  // Asynchronously in background, generate refined AI title using just the initial chat
  try {
    const generatedTitle = await generateConversationTitle(userMessage, assistantMessage);
    if (generatedTitle) {
      await db
        .update(conversations)
        .set({
          title: generatedTitle,
          updatedAt: new Date(),
        })
        .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)));

      await invalidateCache(CACHE_KEYS.conversationList(userId), CACHE_KEYS.conversationDetail(conversationId));

      logger.info("conversation.title_updated", {
        conversationId,
        userId,
        generatedTitle,
      });

      return generatedTitle;
    }
  } catch (err) {
    logger.error("title.background_generation_failed", {
      conversationId,
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return null;
}

