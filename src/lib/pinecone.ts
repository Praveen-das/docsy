import { Pinecone, type RecordMetadata } from "@pinecone-database/pinecone";

let _client: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  if (_client) return _client;

  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing PINECONE_API_KEY environment variable");
  }

  _client = new Pinecone({ apiKey });
  return _client;
}

function getIndexName(): string {
  return process.env.PINECONE_INDEX || "docsy-index";
}

export interface VectorMetadata extends RecordMetadata {
  documentId: string;
  page: number;
  chunkIndex: number;
  textSnippet: string;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: VectorMetadata;
}

/**
 * Upsert vectors into Pinecone under a user-specific namespace.
 * Per PRD §15: namespace = userId for cross-tenant isolation.
 */
export async function upsertVectors(
  userId: string,
  vectors: VectorRecord[]
): Promise<void> {
  const client = getPineconeClient();
  const index = client.index(getIndexName()).namespace(userId);

  // Pinecone batch limit is typically 100 vectors per upsert
  const BATCH_SIZE = 100;
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    await index.upsert(batch);
  }
}

/**
 * Query vectors for similarity search within a user namespace.
 * Filters by documentId to restrict retrieval to conversation-linked documents (PRD §15).
 */
export async function queryVectors(
  userId: string,
  queryVector: number[],
  documentIds: string[],
  topK = 5
): Promise<
  Array<{
    id: string;
    score: number;
    metadata: VectorMetadata;
  }>
> {
  const client = getPineconeClient();
  const index = client.index(getIndexName()).namespace(userId);

  const result = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
    filter: {
      documentId: { $in: documentIds },
    },
  });

  return (result.matches || []).map((match) => ({
    id: match.id,
    score: match.score || 0,
    metadata: match.metadata as VectorMetadata,
  }));
}

/**
 * Delete all vectors for a specific document within a user namespace.
 * Called when a document is deleted (PRD §10 FR-06).
 */
export async function deleteDocumentVectors(
  userId: string,
  documentId: string
): Promise<void> {
  const client = getPineconeClient();
  const index = client.index(getIndexName()).namespace(userId);

  // Delete by metadata filter
  await index.deleteMany({
    documentId: { $eq: documentId },
  });
}
