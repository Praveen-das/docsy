import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

let _embeddings: GoogleGenerativeAIEmbeddings | null = null;

/**
 * Get a singleton LangChain Gemini embedding instance.
 * Uses `text-embedding-004` (768 dimensions) — must match Pinecone index config.
 */
function getEmbeddingsModel(): GoogleGenerativeAIEmbeddings {
  if (_embeddings) return _embeddings;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  _embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey,
    modelName: "text-embedding-004",
  });

  return _embeddings;
}

/**
 * Embed multiple text chunks (batch).
 * Returns an array of 768-dimensional vectors, one per input text.
 */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const model = getEmbeddingsModel();
  return model.embedDocuments(texts);
}

/**
 * Embed a single query string.
 * Returns a single 768-dimensional vector.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const model = getEmbeddingsModel();
  return model.embedQuery(text);
}
