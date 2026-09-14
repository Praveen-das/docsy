import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { getCached, setCached, invalidateCache, CACHE_TTL } from "@/lib/cache";
import { CACHE_KEYS } from "@/lib/cache-keys";
import { getRedisClient } from "@/lib/redis";

import type { UserRecord } from "@/db/schema";

/**
 * Create a new user record in the database.
 * Invoked on Clerk `user.created` webhook event.
 */
export async function createUser(clerkUserId: string, name: string, email: string): Promise<UserRecord> {
  const [user] = await db
    .insert(users)
    .values({
      id: clerkUserId,
      name,
      email,
    })
    .onConflictDoNothing({ target: users.id })
    .returning();

  if (user) {
    logger.info("user.created", { userId: clerkUserId, email });
    return user;
  }

  const existing = await getUserById(clerkUserId);
  return existing!;
}

/**
 * Update an existing user record with fresh Clerk metadata.
 * Invoked on Clerk `user.updated` webhook event.
 */
export async function updateUser(clerkUserId: string, name: string, email: string): Promise<UserRecord | null> {
  const [user] = await db
    .update(users)
    .set({
      name,
      email,
      updatedAt: new Date(),
    })
    .where(eq(users.id, clerkUserId))
    .returning();

  if (user) {
    await invalidateCache(CACHE_KEYS.userProfile(clerkUserId));
    logger.info("user.updated", { userId: clerkUserId, email });
  }
  return user || null;
}

/**
 * Upsert a user from Clerk data (webhook or on-demand).
 * Atomically inserts a new user or updates name & email if the user already exists.
 * Prevents race conditions and guarantees synchronization.
 */
export async function upsertUser(clerkUserId: string, name: string, email: string): Promise<UserRecord> {
  const [user] = await db
    .insert(users)
    .values({
      id: clerkUserId,
      name,
      email,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name,
        email,
        updatedAt: new Date(),
      },
    })
    .returning();

  logger.info("user.synced", { userId: clerkUserId, email });
  await invalidateCache(CACHE_KEYS.userProfile(clerkUserId));
  return user;
}

/**
 * Ensure a Clerk user exists in our app database.
 * Atomically upserts the record to guarantee safety against race conditions.
 */
export async function ensureUser(clerkUserId: string, name: string, email: string): Promise<UserRecord> {
  return upsertUser(clerkUserId, name, email);
}

/**
 * Delete a user by Clerk ID (called on user.deleted webhook).
 * Foreign keys on documents and conversations will cascade delete.
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const result = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id });

  if (result.length > 0) {
    await invalidateCache(CACHE_KEYS.userProfile(userId));
    logger.info("user.deleted", { userId, count: result.length });
    return true;
  }

  return false;
}

/**
 * Get user by Clerk ID. Returns null if not found.
 */
export async function getUserById(userId: string): Promise<UserRecord | null> {
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  return result[0] || null;
}

/**
 * Get user profile with quota info for dashboard/settings display.
 * Backed by Redis cache with real-time daily quota reading.
 */
export async function getUserProfile(userId: string) {
  const cacheKey = CACHE_KEYS.userProfile(userId);
  const today = new Date().toISOString().slice(0, 10);
  const quotaKey = CACHE_KEYS.userDailyQuota(userId, today);
  const redis = getRedisClient();

  if (redis) {
    try {
      const [rawProfile, rawQuota] = await redis.mget(cacheKey, quotaKey);

      if (rawProfile) {
        const cached = JSON.parse(rawProfile) as {
          id: string;
          name: string;
          email: string;
          dailyQueriesUsed: number;
          dailyQueriesLimit: number;
          createdAt: string;
        };
        return {
          ...cached,
          dailyQueriesUsed: rawQuota !== null ? Number(rawQuota) : cached.dailyQueriesUsed,
        };
      }
    } catch {
      // Fall through to DB fallback on cache error
    }
  } else {
  }

  const user = await getUserById(userId);
  if (!user) return null;

  const usedToday = redis ? ((await redis.get(quotaKey)) ?? 0) : user.dailyQueriesUsed;

  const profile = {
    id: user.id,
    name: user.name,
    email: user.email,
    dailyQueriesUsed: Number(usedToday),
    dailyQueriesLimit: user.dailyQueriesLimit,
    createdAt: user.createdAt.toISOString(),
  };

  await setCached(cacheKey, profile, CACHE_TTL.USER_PROFILE);
  return profile;
}

/**
 * Increment the daily query counter using an atomic Redis pipeline.
 * Bundles INCR, SADD, and profile limit check into a single roundtrip.
 * The daily quota key naturally expires at midnight UTC.
 */
export async function incrementQueryCount(userId: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) {
    console.log("Redis not available");
    return true;
  }

  const today = new Date().toISOString().slice(0, 10);
  const quotaKey = CACHE_KEYS.userDailyQuota(userId, today);
  const profileKey = CACHE_KEYS.userProfile(userId);

  // Single roundtrip: increment counter, record in dirty set, and read profile limit
  const pipeline = redis.pipeline();
  pipeline.incr(quotaKey);
  pipeline.sadd(CACHE_KEYS.quotaDirtyUsers, userId);
  pipeline.get(profileKey);

  const results = await pipeline.exec();
  const count = results?.[0]?.[1] !== undefined ? Number(results[0][1]) : 0;
  const rawProfile = results?.[2]?.[1] as string | null | undefined;
  let cachedProfile: { dailyQueriesLimit?: number } | null = null;

  if (rawProfile && typeof rawProfile === "string") {
    try {
      cachedProfile = JSON.parse(rawProfile);
    } catch {
      // ignore parse error
    }
  }
  console.log({ results, count, cachedProfile });

  // If this is the first query of the day, set expiration to midnight UTC asynchronously
  if (count === 1) {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    const ttlSeconds = Math.max(Math.floor((midnight.getTime() - now.getTime()) / 1000), 60);
    redis.expire(quotaKey, ttlSeconds).catch(() => {});
  }

  let limit = cachedProfile?.dailyQueriesLimit;
  if (limit === undefined) {
    const user = await getUserById(userId);
    limit = user?.dailyQueriesLimit ?? 25;
  }

  return count <= limit;
}
