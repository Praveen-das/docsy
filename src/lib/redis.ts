import Redis from "ioredis";
import { logger } from "@/lib/logger";

// Global singleton to prevent connection leaks during Next.js development HMR
const globalForRedis = globalThis as unknown as {
  redisClient?: Redis | null;
};

/**
 * Returns a singleton ioredis client instance, or null if credentials
 * are not configured in the environment.
 */
export function getRedisClient(): Redis | null {
  if (globalForRedis.redisClient) {
    return globalForRedis.redisClient;
  }

  const url = process.env.UPSTASH_REDIS_URL;

  if (!url) {
    logger.warn("redis.missing_credentials", {
      message: "UPSTASH_REDIS_URL or REDIS_URL not configured. Redis client will be unavailable.",
    });
    return null;
  }

  try {
    const client = new Redis(url, {
      family: 4,
      keepAlive: 10000,
      noDelay: true,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      connectTimeout: 10000,
      lazyConnect: false,
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      },
    });

    client.on("error", (err) => {
      logger.error("redis.connection_error", {
        error: err instanceof Error ? err.message : String(err),
      });
    });

    globalForRedis.redisClient = client;
    return client;
  } catch (err) {
    logger.error("redis.init_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    globalForRedis.redisClient = null;
    return null;
  }
}

/**
 * Singleton Redis client instance.
 */
export const redis = getRedisClient();

export default redis;
