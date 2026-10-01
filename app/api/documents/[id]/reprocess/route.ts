import { NextResponse } from "next/server";
import { withAuthRoute } from "@/lib/api-auth";
import { reprocessDocument } from "@/services/document.service";

/**
 * POST /api/documents/:id/reprocess
 * Re-trigger the processing pipeline for a failed document.
 */
export const POST = withAuthRoute(async ({ userId, params }) => {
  const success = await reprocessDocument(userId, params.id);

  if (!success) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, status: "UPLOADING" });
});
