import {
  pgTable,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Users table.
 * `id` is the Clerk user ID (e.g. "user_2xABC...") — NOT a uuid.
 * App-specific fields like quota tracking live here while Clerk owns identity.
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  dailyQueriesUsed: integer("daily_queries_used").notNull().default(0),
  dailyQueriesLimit: integer("daily_queries_limit").notNull().default(25),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserRecord = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
