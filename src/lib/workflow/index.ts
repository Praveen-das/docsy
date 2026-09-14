import { Client } from "@upstash/workflow";
import { logger } from "@/lib/logger";

let workflowClient: Client | null = null;

/**
 * Get or initialize the Upstash Workflow client singleton.
 */
export function getWorkflowClient(): Client {
  if (workflowClient) return workflowClient;

  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    logger.error("workflow.missing_qstash_token", {
      message: "QSTASH_TOKEN is not configured in .env. Go to Upstash Console -> QStash to get your token.",
    });
    throw new Error("Missing QSTASH_TOKEN environment variable. Please configure your QStash token in .env.");
  }

  workflowClient = new Client({
    token,
    baseUrl: process.env.QSTASH_URL,
  });
  return workflowClient;
}

/**
 * Trigger the document-processing workflow directly.
 *
 * `@upstash/workflow`'s Client.trigger() sends the initial request
 * to the workflow endpoint, and `serve()` takes over from there —
 * handling QStash delivery, retries, and step checkpointing internally.
 */
export async function triggerProcessingWorkflow(documentId: string): Promise<void> {
  const client = getWorkflowClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { workflowRunId } = await client.trigger({
    url: `${appUrl}/api/workflows/process-document`,
    body: { documentId },
  });

  logger.info("workflow.triggered", { documentId, workflowRunId });
}
