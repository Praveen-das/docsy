import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getDocument,
  toggleFavoriteDocument,
} from "@/services/document.service";

/**
 * POST /api/documents/:id/favorite
 * Toggle favorite status for a document.
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

  // Verify document exists and belongs to user
  const doc = await getDocument(userId, id);
  if (!doc) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  const result = await toggleFavoriteDocument(userId, id);

  return NextResponse.json({
    success: true,
    documentId: id,
    isFavorite: result.isFavorite,
  });
}
