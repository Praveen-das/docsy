import { Client } from "@upstash/workflow";
import { logger } from "@/lib/logger";
import type { ChatWorkflowPayload } from "@/types/chat.types";

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

/**
 * Resolve the origin URL from incoming request headers,
 * falling back to NEXT_PUBLIC_APP_URL or localhost.
 */
function resolveOrigin(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return host
    ? `${proto}://${host}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Trigger the durable chat workflow via QStash.
 * Resolves the correct origin from request headers so it works behind
 * reverse proxies, ngrok tunnels, and in local dev.
 */
export async function triggerChatWorkflow(
  request: Request,
  conversationId: string,
  payload: ChatWorkflowPayload,
): Promise<{ workflowRunId: string }> {
  const client = getWorkflowClient();
  const origin = resolveOrigin(request);
  const workflowUrl = `${origin}/api/conversations/${conversationId}/messages/stream`;

  const { workflowRunId } = await client.trigger({
    url: workflowUrl,
    body: payload,
  });

  logger.info("chat.workflow_dispatched", {
    conversationId,
    messageId: payload.messageId,
    workflowRunId,
    workflowUrl,
  });

  return { workflowRunId };
}
