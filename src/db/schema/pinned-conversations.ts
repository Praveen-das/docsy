import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { conversations } from "./conversations";

/**
 * Junction table for user-pinned conversations.
 * Composite primary key on (user_id, conversation_id).
 */
export const pinnedConversations = pgTable(
  "pinned_conversations",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.conversationId] }),
    index("pinned_conversations_user_id_idx").on(table.userId),
  ]
);

export type PinnedConversationRecord = typeof pinnedConversations.$inferSelect;
export type NewPinnedConversation = typeof pinnedConversations.$inferInsert;
