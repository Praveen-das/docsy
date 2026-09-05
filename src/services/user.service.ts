import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

import type { UserRecord } from "@/db/schema";

/**
 * Create a new user record in the database.
 * Invoked on Clerk `user.created` webhook event.
 */
export async function createUser(
  clerkUserId: string,
  name: string,
  email: string
): Promise<UserRecord> {
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
export async function updateUser(
  clerkUserId: string,
  name: string,
  email: string
): Promise<UserRecord | null> {
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
    logger.info("user.updated", { userId: clerkUserId, email });
  }
  return user || null;
}

/**
 * Upsert a user from Clerk data (webhook or on-demand).
 * Atomically inserts a new user or updates name & email if the user already exists.
 * Prevents race conditions and guarantees synchronization.
 */
export async function upsertUser(
  clerkUserId: string,
  name: string,
  email: string
): Promise<UserRecord> {
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
  return user;
}

/**
 * Ensure a Clerk user exists in our app database.
 * Atomically upserts the record to guarantee safety against race conditions.
 */
export async function ensureUser(
  clerkUserId: string,
  name: string,
  email: string
): Promise<UserRecord> {
  return upsertUser(clerkUserId, name, email);
}

/**
 * Delete a user by Clerk ID (called on user.deleted webhook).
 * Foreign keys on documents and conversations will cascade delete.
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const result = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  logger.info("user.deleted", { userId, count: result.length });
  return result.length > 0;
}

/**
 * Get user by Clerk ID. Returns null if not found.
 */
export async function getUserById(
  userId: string
): Promise<UserRecord | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get user profile with quota info for dashboard/settings display.
 */
export async function getUserProfile(userId: string) {
  const user = await getUserById(userId);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    dailyQueriesUsed: user.dailyQueriesUsed,
    dailyQueriesLimit: user.dailyQueriesLimit,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Increment the daily query counter. Returns false if quota exceeded.
 */
export async function incrementQueryCount(
  userId: string
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) return false;

  if (user.dailyQueriesUsed >= user.dailyQueriesLimit) {
    return false;
  }

  await db
    .update(users)
    .set({
      dailyQueriesUsed: user.dailyQueriesUsed + 1,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return true;
}
