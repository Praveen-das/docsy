import { Client } from "@upstash/workflow";
import { logger } from "@/lib/logger";

/**
 * Trigger the document-processing workflow directly.
 *
 * `@upstash/workflow`'s Client.trigger() sends the initial request
 * to the workflow endpoint, and `serve()` takes over from there —
 * handling QStash delivery, retries, and step checkpointing internally.
 */
export async function triggerProcessingWorkflow(
  documentId: string
): Promise<void> {
  const client = new Client({ token: process.env.QSTASH_TOKEN! });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { workflowRunId } = await client.trigger({
    url: `${appUrl}/api/workflows/process-document`,
    body: { documentId },
  });

  logger.info("workflow.triggered", { documentId, workflowRunId });
}
