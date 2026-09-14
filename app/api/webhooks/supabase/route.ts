import { NextRequest, NextResponse } from "next/server";
import { handleStorageObjectCreated } from "@/services/document.service";
import { logger } from "@/lib/logger";

interface SupabaseWebhookPayload<T = Record<string, unknown>> {
  type: "INSERT" | "UPDATE" | "DELETE" | string;
  table: string;
  schema: string;
  record: T | null;
  old_record: T | null;
}

/**
 * POST /api/webhooks/supabase
 *
 * Webhook handler for Supabase Database and Storage events.
 * Logs payload metadata and contents for monitoring, debugging, and audit trails.
 * Supports optional secret verification via SUPABASE_WEBHOOK_SECRET.
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
        logger.warn("supabase.webhook.unauthorized", {
          ip: request.headers.get("x-forwarded-for") || "unknown",
        });
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = (await request.json()) as SupabaseWebhookPayload;

    logger.info("supabase.webhook.received", {
      type: payload?.type,
      table: payload?.table,
      schema: payload?.schema,
      recordId: (payload?.record as { id?: unknown })?.id ?? undefined,
      payload,
    });

    // If this is a storage object INSERT event, trigger the document workflow
    let handlerResult: Record<string, unknown> | undefined;
    if (
      payload?.schema === "storage" &&
      payload?.table === "objects" &&
      payload?.type === "INSERT"
    ) {
      const record = payload.record as { name?: string; bucket_id?: string } | null;
      if (record?.name) {
        handlerResult = await handleStorageObjectCreated(record.name, record.bucket_id);
      }
    }

    return NextResponse.json(
      {
        received: true,
        type: payload?.type,
        table: payload?.table,
        ...(handlerResult && { processing: handlerResult }),
      },
      { status: 200 }
    );
  } catch (err) {
    logger.error("supabase.webhook.failed", {
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json(
      { error: "Invalid webhook payload or internal error" },
      { status: 400 }
    );
  }
}

/**
 * GET /api/webhooks/supabase
 *
 * Lightweight health check for webhook URL configuration verification.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/webhooks/supabase",
  });
}
