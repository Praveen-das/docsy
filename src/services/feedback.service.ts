import { db } from "@/db";
import { feedback, feedbackAttachments } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { logger } from "@/lib/logger";
import type { FeedbackCategory } from "@/features/feedback/types";
import type { NewFeedbackAttachment } from "@/db/schema";

export interface CreateFeedbackParams {
  userId: string;
  category: FeedbackCategory;
  message: string;
  attachments?: Omit<NewFeedbackAttachment, "id" | "feedbackId">[];
}

export interface FeedbackWithAttachments {
  id: string;
  userId: string;
  category: string;
  message: string;
  createdAt: Date;
  attachments: {
    id: string;
    name: string;
    size: number;
    type: string;
    storagePath: string;
    publicUrl: string;
  }[];
}

/**
 * Insert a feedback record and its attachments in a single transaction.
 */
export async function submitFeedback(params: CreateFeedbackParams): Promise<FeedbackWithAttachments> {
  const result = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(feedback)
      .values({
        userId: params.userId,
        category: params.category,
        message: params.message,
      })
      .returning();

    let attachmentRows: (typeof feedbackAttachments.$inferSelect)[] = [];

    if (params.attachments && params.attachments.length > 0) {
      attachmentRows = await tx
        .insert(feedbackAttachments)
        .values(
          params.attachments.map((a) => ({
            feedbackId: row.id,
            name: a.name,
            size: a.size,
            type: a.type,
            storagePath: a.storagePath,
            publicUrl: a.publicUrl,
          }))
        )
        .returning();
    }

    return { feedback: row, attachments: attachmentRows };
  });

  logger.info("feedback.submitted", {
    id: result.feedback.id,
    userId: params.userId,
    category: params.category,
    attachmentCount: result.attachments.length,
  });

  return {
    id: result.feedback.id,
    userId: result.feedback.userId,
    category: result.feedback.category,
    message: result.feedback.message,
    createdAt: result.feedback.createdAt,
    attachments: result.attachments.map((a) => ({
      id: a.id,
      name: a.name,
      size: a.size,
      type: a.type,
      storagePath: a.storagePath,
      publicUrl: a.publicUrl,
    })),
  };
}

/**
 * List feedback for a specific user, most recent first, with attachments.
 */
export async function listFeedbackByUser(userId: string): Promise<FeedbackWithAttachments[]> {
  const rows = await db
    .select()
    .from(feedback)
    .where(eq(feedback.userId, userId))
    .orderBy(desc(feedback.createdAt));

  if (rows.length === 0) return [];

  const feedbackIds = rows.map((r) => r.id);
  const allAttachments = await db
    .select()
    .from(feedbackAttachments)
    .where(inArray(feedbackAttachments.feedbackId, feedbackIds));

  const attachmentsByFeedbackId = new Map<string, (typeof allAttachments)[number][]>();
  for (const a of allAttachments) {
    const existing = attachmentsByFeedbackId.get(a.feedbackId) ?? [];
    existing.push(a);
    attachmentsByFeedbackId.set(a.feedbackId, existing);
  }

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    category: r.category,
    message: r.message,
    createdAt: r.createdAt,
    attachments: (attachmentsByFeedbackId.get(r.id) ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      size: a.size,
      type: a.type,
      storagePath: a.storagePath,
      publicUrl: a.publicUrl,
    })),
  }));
}
