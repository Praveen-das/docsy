import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { defaultEmbeddingSettingsMiddleware, embed, embedMany, wrapEmbeddingModel } from "ai";

// Matches Pinecone index dimension
const EMBEDDING_DIMENSIONS = 1024;
const EMBEDDING_MODEL_ID = "gemini-embedding-001" as const;

let _googleClient: ReturnType<typeof createGoogleGenerativeAI> | null = null;

/**
 * Get or initialize the Google Generative AI provider instance.
 */
function getGoogleClient() {
  if (_googleClient) return _googleClient;

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  _googleClient = createGoogleGenerativeAI({ apiKey });
  return _googleClient;
}

const optimizedGoogleModel = () => {
  let google = getGoogleClient();
  return wrapEmbeddingModel({
    model: google.embedding(EMBEDDING_MODEL_ID),
    middleware: defaultEmbeddingSettingsMiddleware({
      settings: {
        providerOptions: {
          google: {
            taskType: "RETRIEVAL_DOCUMENT", // Optimizes vectors for knowledge base indexing
            outputDimensionality: EMBEDDING_DIMENSIONS,
          },
        },
      },
    }),
  });
};

/**
 * Embed multiple text chunks (batch).
 * Returns an array of 1024-dimensional vectors matching Pinecone index config.
 */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) return [];

  // Ensure non-empty text strings to prevent Google API rejection on empty content parts
  const sanitizedTexts = texts.map((t) => (t && t.trim().length > 0 ? t : " "));

  const { embeddings } = await embedMany({
    model: optimizedGoogleModel(),
    values: sanitizedTexts,
  });

  return embeddings;
}

/**
 * Embed a single query string.
 * Returns a single 1024-dimensional vector matching Pinecone index config.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const google = getGoogleClient();
  const sanitizedText = text && text.trim().length > 0 ? text : " ";

  const { embedding } = await embed({
    model: google.embedding(EMBEDDING_MODEL_ID),
    value: sanitizedText,
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        taskType: "RETRIEVAL_QUERY",
      },
    },
  });

  return embedding;
}
