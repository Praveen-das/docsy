import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { getRedisClient } from "@/lib/redis";
import { CACHE_KEYS } from "@/lib/cache-keys";

export interface QuotaSyncResult {
  processed: number;
  remaining?: number;
  error?: string;
}

/**
 * Synchronize daily quota counters from Redis dirty set to PostgreSQL in bulk.
 *
 * 1. Atomically pops a batch of dirty user IDs from Redis.
 * 2. Fetches their live daily usage from Redis via MGET.
 * 3. Flushes counts to PostgreSQL in a single multi-row UPDATE query.
 * 4. Re-queues dirty user IDs on failure to ensure zero data loss.
 */
export async function syncDirtyQuotas(batchSize = 100): Promise<QuotaSyncResult> {
  const redis = getRedisClient();
  if (!redis) {
    logger.warn("quota_sync.redis_unavailable");
    return { processed: 0, error: "redis_unavailable" };
  }

  // 1. Pop dirty user IDs from Redis set atomically
  let rawPopped: string | string[] | null = null;
  try {
    rawPopped = (await redis.spop(CACHE_KEYS.quotaDirtyUsers, batchSize)) as string | string[] | null;
  } catch (err) {
    logger.error("quota_sync.spop_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return { processed: 0, error: "spop_failed" };
  }

  let userIds: string[] = [];
  if (Array.isArray(rawPopped)) {
    userIds = rawPopped;
  } else if (typeof rawPopped === "string") {
    userIds = [rawPopped];
  }

  if (userIds.length === 0) {
    return { processed: 0 };
  }

  const today = new Date().toISOString().slice(0, 10);
  const keys = userIds.map((id) => CACHE_KEYS.userDailyQuota(id, today));

  try {
    // 2. Read live query counts for all dirty users in batch
    const counts = ((await redis.mget(...keys)) || []) as (string | number | null)[];

    const updates: { userId: string; count: number }[] = [];
    for (let i = 0; i < userIds.length; i++) {
      const rawCount = counts[i];
      if (rawCount !== null && rawCount !== undefined) {
        updates.push({
          userId: userIds[i],
          count: Number(rawCount),
        });
      }
    }

    if (updates.length === 0) {
      return { processed: 0 };
    }

    // 3. Persist to PostgreSQL
    if (updates.length === 1) {
      await db
        .update(users)
        .set({
          dailyQueriesUsed: updates[0].count,
          updatedAt: new Date(),
        })
        .where(eq(users.id, updates[0].userId));
    } else {
      // High-performance multi-row bulk update: UPDATE ... FROM (VALUES ...)
      const valueTuples = updates.map(
        (u) => sql`(${u.userId}::text, ${u.count}::integer)`
      );
      const valuesClause = sql.join(valueTuples, sql`, `);

      await db.execute(sql`
        UPDATE users AS u
        SET
          daily_queries_used = v.count,
          updated_at = NOW()
        FROM (VALUES ${valuesClause}) AS v(id, count)
        WHERE u.id = v.id
      `);
    }

    logger.info("quota_sync.batch_persisted", {
      updatedCount: updates.length,
      userIds: updates.map((u) => u.userId),
    });

    return { processed: updates.length };
  } catch (err) {
    // 4. Resilience: push unwritten IDs back to dirty set so next cycle retries
    logger.error("quota_sync.db_write_failed_requeuing", {
      count: userIds.length,
      error: err instanceof Error ? err.message : String(err),
    });

    try {
      if (userIds.length > 0) {
        const [first, ...rest] = userIds;
        await redis.sadd(CACHE_KEYS.quotaDirtyUsers, first, ...rest);
      }
    } catch (requeueErr) {
      logger.error("quota_sync.requeue_failed", {
        error: requeueErr instanceof Error ? requeueErr.message : String(requeueErr),
      });
    }

    return {
      processed: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
