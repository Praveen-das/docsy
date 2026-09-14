import { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { Redis } from "@upstash/redis";
import { z } from "zod";

/**
 * Derives and initializes the Upstash Redis HTTP/REST client
 * required by @upstash/realtime from available environment credentials.
 */
function getUpstashRedisRest(): Redis {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (restUrl && restToken) {
    return new Redis({ url: restUrl, token: restToken });
  }

  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (redisUrl && redisUrl.startsWith("redis")) {
    try {
      const parsed = new URL(redisUrl);
      return new Redis({
        url: `https://${parsed.hostname}`,
        token: parsed.password,
      });
    } catch {
      // Fall through to fromEnv
    }
  }

  return Redis.fromEnv();
}

export const redis = getUpstashRedisRest();

export const schema = {
  ai: {
    chunk: z.any(),
  },
};

export const realtime = new Realtime({ schema, redis });
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
