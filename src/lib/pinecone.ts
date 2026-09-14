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
 * Upsert vectors into Pinecone under a document-specific namespace.
 * namespace = documentId ensures strict isolation per document and enables O(1) deletion.
 */
export async function upsertVectors(
  documentId: string,
  vectors: VectorRecord[]
): Promise<void> {
  const client = getPineconeClient();
  const index = client.index(getIndexName()).namespace(documentId);

  // Pinecone batch limit is typically 100 vectors per upsert
  const BATCH_SIZE = 100;
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    await index.upsert(batch);
  }
}

/**
 * Query vectors for similarity search within a single document namespace.
 * No metadata filter is required since the namespace contains only this document's vectors.
 */
export async function queryVectors(
  documentId: string,
  queryVector: number[],
  topK = 5
): Promise<
  Array<{
    id: string;
    score: number;
    metadata: VectorMetadata;
  }>
> {
  const client = getPineconeClient();
  const index = client.index(getIndexName()).namespace(documentId);

  const result = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  return (result.matches || []).map((match) => ({
    id: match.id,
    score: match.score || 0,
    metadata: match.metadata as VectorMetadata,
  }));
}

/**
 * Delete all vectors for a specific document by purging its namespace.
 * Instant O(1) namespace deletion with zero metadata filter overhead.
 */
export async function deleteDocumentVectors(
  documentId: string
): Promise<void> {
  const client = getPineconeClient();
  await client.index(getIndexName()).namespace(documentId).deleteAll();
}
