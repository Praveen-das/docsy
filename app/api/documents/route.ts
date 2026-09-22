import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listDocuments, listFavoriteDocumentIds } from "@/services/document.service";

/**
 * GET /api/documents
 * List all documents for the authenticated user with favorite status.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [docs, favoriteIds] = await Promise.all([
    listDocuments(userId),
    listFavoriteDocumentIds(userId),
  ]);

  const favoriteSet = new Set(favoriteIds);

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
      isFavorite: favoriteSet.has(d.id),
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
  );
}
