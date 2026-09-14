import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

/**
 * Returns the configured Groq chat language model.
 */
export function getChatModel(): LanguageModel {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable");
  }
  return groq(process.env.GROQ_MODEL || "openai/gpt-oss-120b");
}

/**
 * Returns a fast, lightweight Groq model specifically optimized for
 * low-latency summarization and conversation title generation.
 */
export function getTitleModel(): LanguageModel {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable");
  }
  return groq(process.env.GROQ_TITLE_MODEL || "openai/gpt-oss-20b");
}
