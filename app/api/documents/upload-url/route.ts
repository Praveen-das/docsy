import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createSignedUploadUrl, getPublicUrl } from "@/lib/storage";
import { createDocument } from "@/services/document.service";
import { logger } from "@/lib/logger";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/documents/upload-url
 *
 * Returns a signed upload URL so the browser can upload directly to Supabase
 * Storage — the file never touches this server.
 *
 * Also creates the document DB record in "UPLOADING" status, so the client
 * can immediately start polling for processing updates.
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { filename, fileSize } = body as {
      filename?: string;
      fileSize?: number;
    };

    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { error: "Missing required field: filename" },
        { status: 400 }
      );
    }

    if (!fileSize || typeof fileSize !== "number" || fileSize <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid field: fileSize" },
        { status: 400 }
      );
    }

    // Validate extension
    if (!filename.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Validate size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
        },
        { status: 400 }
      );
    }

    // Generate signed upload URL
    const { filePath, signedUrl, token } = await createSignedUploadUrl(
      userId,
      filename
    );

    // Create DB record so polling can begin immediately.
    // We know the public URL from the storage path (deterministic), so set it now.
    const publicUrl = getPublicUrl(filePath);
    const doc = await createDocument({
      userId,
      filename: filePath,
      originalName: filename,
      fileUrl: publicUrl,
      fileSize,
      status: "UPLOADING",
      processingProgress: 0,
    });

    logger.info("document.upload_url_created", {
      documentId: doc.id,
      userId,
      originalName: filename,
    });

    return NextResponse.json({
      documentId: doc.id,
      signedUrl,
      token,
      filePath,
    });
  } catch (err) {
    logger.error("document.upload_url_failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json(
      { error: "Failed to create upload URL" },
      { status: 500 }
    );
  }
}
