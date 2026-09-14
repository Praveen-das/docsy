import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDocumentStatuses } from "@/services/document.service";
import { logger } from "@/lib/logger";

const MAX_BATCH_SIZE = 50;

/**
 * POST /api/documents/status
 *
 * Lightweight status polling endpoint backed by an Upstash Redis cache layer with TTL
 * and Redis pipeline batching.
 *
 * Request body:
 * { "documentIds": ["uuid1", "uuid2"] }
 *
 * Response:
 * {
 *   "statuses": [
 *     {
 *       "id": "uuid1",
 *       "status": "EXTRACTING",
 *       "processingProgress": 40,
 *       "error": null,
 *       "pageCount": 10,
 *       "chunkCount": 24,
 *       "updatedAt": "2026-09-06T12:00:00.000Z"
 *     }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const documentIds = body?.documentIds;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json({ error: "Missing or invalid documentIds array" }, { status: 400 });
    }

    // Sanitize string IDs & enforce max batch size
    const validIds = documentIds
      .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      .slice(0, MAX_BATCH_SIZE);

    if (validIds.length === 0) {
      return NextResponse.json({ statuses: [] });
    }

    const statuses = await getDocumentStatuses(userId, validIds);

    return NextResponse.json({ statuses });
  } catch (err) {
    logger.error("document.status_post_failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json({ error: "Failed to retrieve document statuses" }, { status: 500 });
  }
}

/**
 * GET /api/documents/status?ids=id1,id2
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ error: "Missing 'ids' query parameter" }, { status: 400 });
    }

    const validIds = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
      .slice(0, MAX_BATCH_SIZE);

    if (validIds.length === 0) {
      return NextResponse.json({ statuses: [] });
    }

    const statuses = await getDocumentStatuses(userId, validIds);

    return NextResponse.json({ statuses });
  } catch (err) {
    logger.error("document.status_get_failed", {
      userId,
      error: err instanceof Error ? err.message : String(err),
    });

    return NextResponse.json({ error: "Failed to retrieve document statuses" }, { status: 500 });
  }
}
