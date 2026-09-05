import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getDocument,
  deleteDocument,
} from "@/services/document.service";

/**
 * GET /api/documents/:id
 * Get a single document's details with ownership verification.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const doc = await getDocument(userId, id);

  if (!doc) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: doc.id,
    userId: doc.userId,
    filename: doc.filename,
    originalName: doc.originalName,
    fileUrl: doc.fileUrl,
    fileSize: doc.fileSize,
    pageCount: doc.pageCount,
    chunkCount: doc.chunkCount,
    status: doc.status,
    processingProgress: doc.processingProgress,
    error: doc.error,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  });
}

/**
 * DELETE /api/documents/:id
 * Delete a document, its storage file, and its Pinecone vectors.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteDocument(userId, id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
