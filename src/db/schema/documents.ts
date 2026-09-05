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
 * Documents table.
 * Tracks uploaded PDFs, their processing state, and storage location.
 * Status follows the state machine: UPLOADING → EXTRACTING → CHUNKING → EMBEDDING → INDEXING → READY | FAILED
 */
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size").notNull(),
    pageCount: integer("page_count").notNull().default(0),
    chunkCount: integer("chunk_count").notNull().default(0),
    status: text("status", {
      enum: [
        "UPLOADING",
        "EXTRACTING",
        "CHUNKING",
        "EMBEDDING",
        "INDEXING",
        "READY",
        "FAILED",
      ],
    })
      .notNull()
      .default("UPLOADING"),
    processingProgress: integer("processing_progress").notNull().default(0),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("documents_user_id_idx").on(table.userId),
    index("documents_user_id_created_at_idx").on(table.userId, table.createdAt),
  ]
);

export type DocumentRecord = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
