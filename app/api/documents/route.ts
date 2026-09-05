import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { uploadPdf } from "@/lib/storage";
import { publishProcessingJob } from "@/lib/qstash";
import { createDocument, listDocuments } from "@/services/document.service";
import { logger } from "@/lib/logger";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * GET /api/documents
 * List all documents for the authenticated user.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const docs = await listDocuments(userId);

  return NextResponse.json(
    docs.map((d) => ({
      id: d.id,
      userId: d.userId,
      filename: d.filename,
      originalName: d.originalName,
      fileUrl: d.fileUrl,
      fileSize: d.fileSize,
      pageCount: d.pageCount,
      chunkCount: d.chunkCount,
      status: d.status,
      processingProgress: d.processingProgress,
      error: d.error,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
  );
}

/**
 * POST /api/documents
 * Upload a PDF file. Stores in Supabase, creates DB record, dispatches processing job.
 * Returns 202 Accepted with documentId.
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
        },
        { status: 400 },
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { filePath, publicUrl } = await uploadPdf(userId, buffer, file.name);

    // Create database record
    const doc = await createDocument({
      userId,
      filename: filePath,
      originalName: file.name,
      fileUrl: publicUrl,
      fileSize: file.size,
      status: "UPLOADING",
      processingProgress: 0,
    });

    // Dispatch background processing job via QStash
    try {
      await publishProcessingJob(doc.id);
    } catch (err) {
      logger.warn("document.qstash_dispatch_failed", {
        documentId: doc.id,
        error: err instanceof Error ? err.message : String(err),
      });
      // Don't fail the upload — the document is saved, reprocessing can be triggered later
    }

    return NextResponse.json(
      {
        documentId: doc.id,
        status: "UPLOADING",
      },
      { status: 202 },
    );
  } catch (err) {
    logger.error("document.upload_failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
