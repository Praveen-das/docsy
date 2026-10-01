import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyConversationToken } from "./conversation-token";
import { logger } from "./logger";

export type AuthRouteResult<T = { id: string }> =
  | { success: true; userId: string; params: T; errorResponse: null }
  | { success: false; userId: null; params: null; errorResponse: NextResponse };

/**
 * Authenticates the Clerk session and resolves dynamic route parameters.
 * Returns a 401 NextResponse if unauthorized, or the verified userId and resolved params.
 */
export async function getAuthRouteContext<T = { id: string }>(
  paramsPromise: Promise<T>
): Promise<AuthRouteResult<T>> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      userId: null,
      params: null,
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const params = await paramsPromise;
  return {
    success: true,
    userId,
    params,
    errorResponse: null,
  };
}

export type RouteParamsContext<T = { id: string }> = {
  params: Promise<T>;
};

/**
 * Higher-order function to wrap route handlers with Clerk authentication and resolved params.
 */
export function withAuthRoute<T = { id: string }>(
  handler: (ctx: { userId: string; params: T; request: NextRequest }) => Promise<Response | NextResponse>
) {
  return async (request: NextRequest, context: RouteParamsContext<T>): Promise<Response | NextResponse> => {
    const auth = await getAuthRouteContext(context.params);
    if (!auth.success) return auth.errorResponse;
    return handler({ userId: auth.userId, params: auth.params, request });
  };
}

/**
 * Verifies the fast-path HMAC conversation capability token (<0.05ms) and resolves route parameters.
 */
export async function getConversationTokenContext<T extends { id: string }>(
  request: NextRequest,
  paramsPromise: Promise<T>
): Promise<AuthRouteResult<T>> {
  const params = await paramsPromise;
  const token =
    request.headers.get("x-conversation-token") ||
    request.nextUrl.searchParams.get("token") ||
    undefined;

  let userId: string | null = null;
  if (token) {
    const payload = await verifyConversationToken(token);
    if (payload && payload.conversationId === params.id) {
      userId = payload.userId;
    }
  }

  if (!userId) {
    return {
      success: false,
      userId: null,
      params: null,
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    success: true,
    userId,
    params,
    errorResponse: null,
  };
}

/**
 * Verifies Supabase webhook secret if configured.
 * Returns a 401 response on mismatch, or null if authorized/unconfigured.
 */
export function verifySupabaseWebhookSecret(
  request: NextRequest,
  logLabel = "supabase.webhook.unauthorized"
): NextResponse | null {
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (webhookSecret) {
    const headerSecret =
      request.headers.get("x-supabase-webhook-secret") ||
      request.headers.get("x-webhook-secret") ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (headerSecret !== webhookSecret) {
      logger.warn(logLabel, {
        ip: request.headers.get("x-forwarded-for") || "unknown",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  return null;
}
