import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Protected routes — everything except auth pages, landing, and webhook endpoints.
 * Clerk middleware checks for a valid session and redirects to sign-in if missing.
 */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/documents(.*)",
  "/conversations(.*)",
  "/conversation(.*)",
  "/settings(.*)",
  "/billing(.*)",
  "/chat(.*)",
  "/api/documents(.*)",
  "/api/conversations(.*)",
  "/api/auth/me(.*)",
  "/api/stripe/checkout(.*)",
  "/api/stripe/cancel(.*)",
  "/api/stripe/reactivate(.*)",
  "/api/stripe/subscription(.*)",
  // Note: /api/webhooks/clerk, /api/webhooks/stripe, and /api/workflows are unauthenticated endpoints verified via signatures
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow Upstash QStash workflow callbacks to pass through to signature verification
  if (req.headers.get("upstash-signature") || req.headers.get("Upstash-Signature")) {
    return;
  }

  // Allow Stripe webhooks to pass through to signature verification
  if (req.nextUrl.pathname === "/api/webhooks/stripe") {
    return;
  }
  if (isProtectedRoute(req)) {
    // For API requests, return explicit 401 JSON when unauthenticated instead of Clerk's default 404
    if (req.nextUrl.pathname.startsWith("/api")) {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.json(
          { error: "Unauthorized: Session expired or invalid. Please refresh or sign in." },
          { status: 401 },
        );
      }
    } else {
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
