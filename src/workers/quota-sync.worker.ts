import { loadEnvConfig } from "@next/env";

// Automatically load .env.local, .env.development, .env in standalone mode
loadEnvConfig(process.cwd());

import { syncDirtyQuotas } from "@/services/quota-sync.service";
import { logger } from "@/lib/logger";

const FLUSH_INTERVAL_MS = Number(process.env.QUOTA_SYNC_INTERVAL_MS);
const BATCH_SIZE = Number(process.env.QUOTA_SYNC_BATCH_SIZE);

let isFlushing = false;
let isShuttingDown = false;
let intervalId: NodeJS.Timeout | null = null;

/**
 * Execute one flush cycle.
 * Prevents overlapping executions if a previous sync cycle is still active.
 */
export async function runSyncCycle(): Promise<void> {
  if (isFlushing || isShuttingDown) return;

  isFlushing = true;
  try {
    const result = await syncDirtyQuotas(BATCH_SIZE);
    if (result.processed > 0) {
      logger.info("quota_worker.flushed", { processed: result.processed });
    }
  } catch (err) {
    logger.error("quota_worker.cycle_error", {
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    isFlushing = false;
  }
}

/**
 * Start the standalone quota sync loop.
 */
export function startQuotaSyncWorker(): void {
  logger.info("quota_worker.started", {
    intervalMs: FLUSH_INTERVAL_MS,
    batchSize: BATCH_SIZE,
  });

  // Run immediately on boot
  runSyncCycle().catch((err) => {
    logger.error("quota_worker.initial_run_failed", { error: String(err) });
  });

  intervalId = setInterval(() => {
    runSyncCycle().catch((err) => {
      logger.error("quota_worker.interval_run_failed", { error: String(err) });
    });
  }, FLUSH_INTERVAL_MS);
}

/**
 * Gracefully stop the worker and drain any pending in-flight updates.
 */
export async function stopQuotaSyncWorker(): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info("quota_worker.shutting_down");

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Wait for any active flush to settle
  while (isFlushing) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Final flush attempt before shutdown
  try {
    await syncDirtyQuotas(BATCH_SIZE);
    logger.info("quota_worker.final_drain_completed");
  } catch (err) {
    logger.error("quota_worker.final_drain_failed", { error: String(err) });
  }

  logger.info("quota_worker.stopped");
}

// Auto-start if executed directly from CLI: `node ...` or `tsx src/workers/quota-sync.worker.ts`
if (require.main === module || process.argv[1]?.includes("quota-sync.worker")) {
  startQuotaSyncWorker();

  const handleSignal = async (signal: string) => {
    logger.info(`quota_worker.received_signal`, { signal });
    await stopQuotaSyncWorker();
    process.exit(0);
  };

  process.on("SIGINT", () => handleSignal("SIGINT"));
  process.on("SIGTERM", () => handleSignal("SIGTERM"));
}
