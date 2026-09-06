import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyFileExists } from "@/lib/storage";
import { getDocument } from "@/services/document.service";
import { triggerProcessingWorkflow } from "@/lib/qstash";
import { logger } from "@/lib/logger";

/**
 * POST /api/documents/confirm
 *
 * Called by the client after a successful direct-to-storage upload.
 * Verifies the file landed in storage, then triggers the processing workflow.
 * The DB record and fileUrl were already set during /upload-url.
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { documentId } = body as { documentId?: string };

    if (!documentId || typeof documentId !== "string") {
      return NextResponse.json({ error: "Missing required field: documentId" }, { status: 400 });
    }

    // Verify ownership and status
    const doc = await getDocument(userId, documentId);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.status !== "UPLOADING") {
      return NextResponse.json(
        { error: `Document is in '${doc.status}' status, expected 'UPLOADING'` },
        { status: 409 },
      );
    }

    // Verify the file actually exists in storage
    const fileExists = await verifyFileExists(doc.filename);
    if (!fileExists) {
      return NextResponse.json({ error: "File not found in storage — upload may have failed" }, { status: 400 });
    }

    // Trigger the processing workflow
    // try {
    //   await triggerProcessingWorkflow(documentId);
    // } catch (err) {
    //   logger.warn("document.workflow_trigger_failed", {
    //     documentId,
    //     error: err instanceof Error ? err.message : String(err),
    //   });
    //   // Don't fail the confirm — document is saved, reprocessing can be triggered later
    // }

    logger.info("document.upload_confirmed", { documentId, userId });

    return NextResponse.json({ documentId, status: "confirmed" });
  } catch (err) {
    logger.error("document.confirm_failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json({ error: "Failed to confirm upload" }, { status: 500 });
  }
}
