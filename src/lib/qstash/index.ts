import { Client } from "@upstash/qstash";
import { logger } from "@/lib/logger";

let qstashClient: Client | null = null;

/**
 * Get or initialize the Upstash QStash client singleton.
 */
export function getQStashClient(): Client {
  if (qstashClient) return qstashClient;

  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    logger.error("qstash.missing_token", {
      message: "Missing QSTASH_TOKEN environment variable in .env",
    });
    throw new Error("Missing QSTASH_TOKEN environment variable.");
  }

  qstashClient = new Client({
    token,
    baseUrl: process.env.QSTASH_URL || undefined,
  });

  return qstashClient;
}

export interface SetupScheduleOptions {
  cron?: string;
  destinationUrl?: string;
  scheduleId?: string;
}

/**
 * Configure or update a QStash schedule to trigger the quota sync endpoint periodically.
 * Defaults to every 5 minutes ("* / 5 * * * *").
 */
export async function ensureQuotaSyncSchedule(options: SetupScheduleOptions = {}) {
  const client = getQStashClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const destination = options.destinationUrl || `${appUrl}/api/cron/sync-quotas`;
  const cron = options.cron || "*/5 * * * *";
  const scheduleId = options.scheduleId || "sync-quotas-5min";

  // Check if schedule already exists
  const existingSchedules = await client.schedules.list();
  const existing = existingSchedules.find(
    (s) => s.scheduleId === scheduleId || s.destination === destination
  );

  if (existing) {
    if (existing.cron === cron && existing.destination === destination && !existing.isPaused) {
      logger.info("qstash.schedule_already_exists", {
        scheduleId: existing.scheduleId,
        cron,
        destination,
      });
      return { scheduleId: existing.scheduleId, status: "unchanged" as const };
    }

    // Delete existing schedule to recreate with updated parameters
    await client.schedules.delete(existing.scheduleId);
    logger.info("qstash.old_schedule_deleted", { scheduleId: existing.scheduleId });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (process.env.CRON_SECRET) {
    headers["Authorization"] = `Bearer ${process.env.CRON_SECRET}`;
  }

  const result = await client.schedules.create({
    destination,
    cron,
    method: "POST",
    scheduleId,
    headers,
    retries: 3,
  });

  logger.info("qstash.schedule_configured", {
    scheduleId: result.scheduleId,
    cron,
    destination,
  });

  return { scheduleId: result.scheduleId, status: "configured" as const };
}
