import { redis, getRedisClient } from "@/lib/redis";
import { CACHE_KEYS } from "@/lib/cache-keys";
import { logger } from "@/lib/logger";
import type { DocumentStatusDto } from "@/types";


/**
 * Domain-specific TTL constants (in seconds).
 * Tuned according to data change frequency, mutation invalidation, and real-world access patterns:
 *
 * - Because event-driven invalidation immediately flushes keys on mutations (create, update, delete, new message),
 *   TTLs serve as safety nets against missed events/desynchronization rather than primary freshness mechanisms.
 * - Higher TTLs prevent database thrashing during long reading/chatting sessions while maintaining instant consistency.
 */
export const CACHE_TTL = {
  DOCUMENTS_LIST: 300, // 5 minutes: stable document libraries; invalidated on upload/status/delete
  DOCUMENT_META: 1800, // 30 minutes: immutable once ingested; invalidated on reprocess/delete
  DOCUMENT_STATUS: 300, // 5 minutes: active status during workflow progression
  CONVERSATIONS_LIST: 600, // 10 minutes: heavy N+1 multi-join read; invalidated on new message/conv/rename
  CONVERSATION_DETAIL: 1800, // 30 minutes: conversation title & linked docs rarely change; invalidated on rename/delete
  MESSAGES_LIST: 600, // 10 minutes: chat history; invalidated immediately on new message
  USER_PROFILE: 3600, // 1 hours: quota & settings; invalidated on query increment & user sync; auto-heals midnight quota reset
} as const;

export const DOCUMENT_STATUS_TTL_SECONDS = CACHE_TTL.DOCUMENT_STATUS;


/**
 * Safe generic GET with JSON deserialization and error fallback.
 * Returns null on cache miss or any Redis error.
 */
export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const raw = await redis.get(key);
    if (raw === null || raw === undefined) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  } catch (err) {
    logger.warn("cache.get_failed", {
      key,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Safe generic SET with TTL.
 * Silently catches and logs warnings so caching never breaks application flow.
 */
export async function setCached<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const value = typeof data === "string" ? data : JSON.stringify(data);
    await redis.set(key, value, "EX", ttlSeconds);
  } catch (err) {
    logger.warn("cache.set_failed", {
      key,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Invalidate one or more cache keys.
 */
export async function invalidateCache(...keys: (string | null | undefined)[]): Promise<void> {
  const validKeys = keys.filter((k): k is string => typeof k === "string" && k.length > 0);
  if (validKeys.length === 0) return;

  const redis = getRedisClient();
  if (!redis) return;

  try {
    if (validKeys.length === 1) {
      await redis.del(validKeys[0]);
    } else {
      await redis.del(...validKeys);
    }
  } catch (err) {
    logger.warn("cache.invalidate_failed", {
      keys: validKeys,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Generate Redis key for document status cache.
 */
export function getDocumentStatusKey(documentId: string): string {
  return CACHE_KEYS.documentStatus(documentId);
}

/**
 * Write a single document status to Redis with TTL.
 */
export async function setDocumentStatus(
  status: DocumentStatusDto,
  ttlSeconds: number = DOCUMENT_STATUS_TTL_SECONDS,
): Promise<void> {
  return setCached(getDocumentStatusKey(status.id), status, ttlSeconds);
}

/**
 * Batch-write multiple document statuses to Redis using an ioredis pipeline in a single roundtrip.
 */
export async function setDocumentStatusesPipeline(
  statuses: DocumentStatusDto[],
  ttlSeconds: number = DOCUMENT_STATUS_TTL_SECONDS,
): Promise<void> {
  if (!statuses.length) return;
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const pipeline = redis.pipeline();
    for (const status of statuses) {
      pipeline.set(getDocumentStatusKey(status.id), JSON.stringify(status), "EX", ttlSeconds);
    }
    await pipeline.exec();
  } catch (err) {
    logger.warn("cache.pipeline_set_failed", {
      count: statuses.length,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Batch-read document statuses from Redis using an ioredis pipeline in a single roundtrip.
 * Returns map of cached hits and list of missing document IDs.
 */
export async function getDocumentStatusesPipeline(
  documentIds: string[],
): Promise<{ cached: Record<string, DocumentStatusDto>; missingIds: string[] }> {
  if (!documentIds.length) {
    return { cached: {}, missingIds: [] };
  }

  const redis = getRedisClient();
  if (!redis) {
    return { cached: {}, missingIds: [...documentIds] };
  }

  try {
    const pipeline = redis.pipeline();
    for (const id of documentIds) {
      pipeline.get(getDocumentStatusKey(id));
    }

    const results = await pipeline.exec();
    const cached: Record<string, DocumentStatusDto> = {};
    const missingIds: string[] = [];

    for (let i = 0; i < documentIds.length; i++) {
      const id = documentIds[i];
      const res = results ? results[i] : null;
      const err = res ? res[0] : null;
      const raw = res ? (res[1] as string | null) : null;

      if (!err && raw) {
        try {
          const item = JSON.parse(raw) as DocumentStatusDto;
          if (item && item.id) {
            cached[id] = item;
            continue;
          }
        } catch {
          // Deserialization failure, treated as cache miss
        }
      }
      missingIds.push(id);
    }

    return { cached, missingIds };
  } catch (err) {
    logger.warn("cache.pipeline_get_failed", {
      count: documentIds.length,
      error: err instanceof Error ? err.message : String(err),
    });
    return { cached: {}, missingIds: [...documentIds] };
  }
}

/**
 * Invalidate cached document status on deletion or terminal updates.
 */
export async function invalidateDocumentStatus(documentId: string): Promise<void> {
  return invalidateCache(getDocumentStatusKey(documentId));
}
