import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
  "/chat(.*)",
  "/api/documents(.*)",
  "/api/conversations(.*)",
  "/api/auth/me(.*)",
  // Note: /api/webhooks/clerk and /api/workflows are unauthenticated endpoints verified via signatures
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
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
