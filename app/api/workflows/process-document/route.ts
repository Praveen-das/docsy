import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { processDocument } from "@/services/processing.service";
import { logger } from "@/lib/logger";

/**
 * POST /api/workflows/process-document
 *
 * QStash webhook endpoint. Receives document processing jobs and runs
 * the full extraction → chunking → embedding → indexing pipeline.
 *
 * Security: Verifies QStash cryptographic signature before processing.
 */
export async function POST(request: NextRequest) {
  // Verify QStash signature
  const signingKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (!signingKey || !nextSigningKey) {
    logger.error("workflow.missing_signing_keys", {});
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const receiver = new Receiver({
    currentSigningKey: signingKey,
    nextSigningKey: nextSigningKey,
  });

  const body = await request.text();
  const signature = request.headers.get("upstash-signature") || "";

  try {
    const isValid = await receiver.verify({
      signature,
      body,
    });

    if (!isValid) {
      logger.warn("workflow.invalid_signature", {});
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
  } catch (err) {
    // In development, allow unsigned requests for local testing
    if (process.env.NODE_ENV !== "development") {
      logger.warn("workflow.signature_verification_failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 }
      );
    }
  }

  // Parse the document ID from the request body
  let documentId: string;
  try {
    const parsed = JSON.parse(body);
    documentId = parsed.documentId;

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing documentId" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  // Run the processing pipeline
  try {
    await processDocument(documentId);
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("workflow.processing_failed", {
      documentId,
      error: err instanceof Error ? err.message : String(err),
    });

    // Return 500 so QStash retries on transient errors
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}
