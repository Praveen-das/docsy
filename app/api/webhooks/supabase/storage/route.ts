import { NextRequest, NextResponse } from "next/server";
import { handleStorageObjectCreated } from "@/services/document.service";
import { logger } from "@/lib/logger";

interface StorageObjectWebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE" | string;
  table: string;
  schema: string;
  record: {
    id: string;
    name: string; // e.g. "user_xxx/uuid.pdf"
    bucket_id: string; // "documents"
    metadata?: {
      size?: number;
      mimetype?: string;
    };
  } | null;
  old_record: unknown;
}

/**
 * POST /api/webhooks/supabase/storage
 *
 * Dedicated webhook endpoint for Supabase Storage object creation events.
 * Fires automatically when a file is uploaded to the storage bucket.
 * Triggers the QStash document processing pipeline directly on the server,
 * decoupling workflow initiation from the client.
 */
export async function POST(request: NextRequest) {
  try {
    // Optional webhook secret verification
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const headerSecret =
        request.headers.get("x-supabase-webhook-secret") ||
        request.headers.get("x-webhook-secret") ||
        request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

      if (headerSecret !== webhookSecret) {
        logger.warn("supabase.storage_webhook.unauthorized", {
          ip: request.headers.get("x-forwarded-for") || "unknown",
        });
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = (await request.json()) as StorageObjectWebhookPayload;

    logger.info("supabase.storage_webhook.received", {
      type: payload?.type,
      table: payload?.table,
      schema: payload?.schema,
      filename: payload?.record?.name,
      bucket: payload?.record?.bucket_id,
    });

    // Handle INSERT events for storage objects
    if (payload.type === "INSERT" && payload.record?.name) {
      const result = await handleStorageObjectCreated(payload.record.name, payload.record.bucket_id);

      return NextResponse.json({
        received: true,
        ...result,
      });
    }

    return NextResponse.json({ received: true, ignored: true });
  } catch (err) {
    logger.error("supabase.storage_webhook.failed", {
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json({ error: "Invalid webhook payload or internal error" }, { status: 400 });
  }
}

/**
 * GET /api/webhooks/supabase/storage
 *
 * Lightweight health check for storage webhook configuration.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/webhooks/supabase/storage",
  });
}
