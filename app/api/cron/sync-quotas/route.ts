import { NextRequest, NextResponse } from "next/server";
import { syncDirtyQuotas } from "@/services/quota-sync.service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Handle cron-triggered batch quota synchronization.
 * Can be invoked by:
 * - Upstash QStash scheduled message
 * - Vercel Cron
 * - External webhook / cron service
 */
async function handleSync(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Verify secret if configured
  if (cronSecret) {
    const bearerToken = authHeader?.replace(/^Bearer\s+/i, "");
    const headerSecret = request.headers.get("x-cron-secret");
    if (bearerToken !== cronSecret && headerSecret !== cronSecret) {
      logger.warn("cron.sync_quotas_unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await syncDirtyQuotas();
    return NextResponse.json({
      success: true,
      processed: result.processed,
      error: result.error ?? null,
    });
  } catch (err) {
    logger.error("cron.sync_quotas_error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}

export async function GET(request: NextRequest) {
  return handleSync(request);
}
