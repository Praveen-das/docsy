import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Feedback submissions table.
 * Stores user-submitted feedback categorised by type.
 */
export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category", {
      enum: ["idea", "bug", "performance", "parsing", "general"],
    }).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("feedback_user_id_idx").on(table.userId),
    index("feedback_created_at_idx").on(table.createdAt),
  ]
);

/**
 * Feedback attachments table.
 * Each feedback entry can have up to 5 file attachments stored in Supabase Storage.
 */
export const feedbackAttachments = pgTable(
  "feedback_attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => feedback.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    size: integer("size").notNull(),
    type: text("type").notNull(),
    storagePath: text("storage_path").notNull(),
    publicUrl: text("public_url").notNull(),
  },
  (table) => [
    index("feedback_attachments_feedback_id_idx").on(table.feedbackId),
  ]
);

export type FeedbackRecord = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
export type FeedbackAttachmentRecord = typeof feedbackAttachments.$inferSelect;
export type NewFeedbackAttachment = typeof feedbackAttachments.$inferInsert;
