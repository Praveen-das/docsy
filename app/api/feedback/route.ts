import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitFeedback, listFeedbackByUser } from "@/services/feedback.service";
import { uploadFeedbackAttachment } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { FEEDBACK_CATEGORIES } from "@/features/feedback/types";
import type { FeedbackCategory } from "@/features/feedback/types";

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const feedbackBodySchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message must be 5000 characters or fewer"),
  category: z.enum(FEEDBACK_CATEGORIES as [string, ...string[]]),
});

/**
 * GET /api/feedback
 * List feedback for the authenticated user.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await listFeedbackByUser(userId);
    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    logger.error("feedback.list_failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to list feedback" }, { status: 500 });
  }
}

/**
 * POST /api/feedback
 * Submit feedback with optional file attachments (FormData).
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    // Validate text fields
    const rawMessage = formData.get("message");
    const rawCategory = formData.get("category");

    const parsed = feedbackBodySchema.safeParse({
      message: rawMessage,
      category: rawCategory,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { message, category } = parsed.data;

    // Validate and upload file attachments
    const fileEntries = formData.getAll("files").filter(
      (entry): entry is File => entry instanceof File && entry.size > 0
    );

    if (fileEntries.length > MAX_ATTACHMENTS) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_ATTACHMENTS} attachments allowed` },
        { status: 400 }
      );
    }

    const uploadedAttachments: {
      name: string;
      size: number;
      type: string;
      storagePath: string;
      publicUrl: string;
    }[] = [];

    for (const file of fileEntries) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 10MB limit` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const { storagePath, publicUrl } = await uploadFeedbackAttachment(
        userId,
        buffer,
        file.name,
        file.type || "application/octet-stream"
      );

      uploadedAttachments.push({
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        storagePath,
        publicUrl,
      });
    }

    const item = await submitFeedback({
      userId,
      category: category as FeedbackCategory,
      message,
      attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
    });

    return NextResponse.json(
      {
        id: item.id,
        userId: item.userId,
        category: item.category,
        message: item.message,
        attachments: item.attachments,
        createdAt: item.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    logger.error("feedback.submit_failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
