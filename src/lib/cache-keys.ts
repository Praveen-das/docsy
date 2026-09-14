/**
 * Centralized key naming conventions across the application for Redis caching.
 */
export const CACHE_KEYS = {
  documentList: (userId: string) => `user:${userId}:documents`,
  documentMeta: (docId: string) => `doc:${docId}:meta`,
  documentStatus: (docId: string) => `doc:status:${docId}`,
  conversationList: (userId: string) => `user:${userId}:conversations`,
  conversationDetail: (convId: string) => `conv:${convId}:details`,
  conversationMessages: (convId: string) => `conv:${convId}:messages`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  userDailyQuota: (userId: string, dateStr: string) => `user:${userId}:quota:${dateStr}`,
  quotaDirtyUsers: "quota:dirty_users",
} as const;

export type CacheKeys = typeof CACHE_KEYS;
