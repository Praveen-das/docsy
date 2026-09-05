import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { reprocessDocument } from "@/services/document.service";

/**
 * POST /api/documents/:id/reprocess
 * Re-trigger the processing pipeline for a failed document.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const success = await reprocessDocument(userId, id);

  if (!success) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, status: "UPLOADING" });
}
