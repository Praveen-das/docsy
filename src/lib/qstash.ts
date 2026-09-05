import { Client } from "@upstash/qstash";

let _client: Client | null = null;

function getQStashClient(): Client {
  if (_client) return _client;

  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    throw new Error("Missing QSTASH_TOKEN environment variable");
  }

  _client = new Client({ token });
  return _client;
}

/**
 * Dispatch a document processing job to the background workflow endpoint.
 * QStash will POST to `/api/workflows/process-document` with the documentId.
 */
export async function publishProcessingJob(documentId: string): Promise<void> {
  const client = getQStashClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const targetUrl = `${appUrl}/api/workflows/process-document`;

  await client.publishJSON({
    url: targetUrl,
    body: { documentId },
    retries: 3,
  });
}
