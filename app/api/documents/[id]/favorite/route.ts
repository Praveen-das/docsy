import { NextResponse } from "next/server";
import { withAuthRoute } from "@/lib/api-auth";
import {
  getDocument,
  toggleFavoriteDocument,
} from "@/services/document.service";

/**
 * POST /api/documents/:id/favorite
 * Toggle favorite status for a document.
 */
export const POST = withAuthRoute(async ({ userId, params }) => {
  const doc = await getDocument(userId, params.id);
  if (!doc) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  const result = await toggleFavoriteDocument(userId, params.id);

  return NextResponse.json({
    success: true,
    documentId: params.id,
    isFavorite: result.isFavorite,
  });
});
