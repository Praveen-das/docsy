import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { createUser, updateUser, deleteUser } from "@/services/user.service";
import { logger } from "@/lib/logger";

/**
 * POST /api/webhooks/clerk
 * Handles incoming Clerk webhook events (user.created, user.updated, user.deleted).
 * Cryptographically verified using @clerk/nextjs/webhooks (Svix Standard Webhooks).
 */
export async function POST(req: Request) {
  let evt;

  try {
    // verifyWebhook checks headers (svix-id, svix-timestamp, svix-signature)
    // and verifies against process.env.CLERK_WEBHOOK_SIGNING_SECRET
    evt = await verifyWebhook(req as any);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook verification failed";
    logger.warn("clerk.webhook.verification_failed", { error: message });
    return Response.json({ error: "Invalid webhook signature", details: message }, { status: 400 });
  }

  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created": {
        const user = evt.data;
        const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "User";
        const primaryEmail =
          user.email_addresses?.find((e) => e.id === user.primary_email_address_id)?.email_address ||
          user.email_addresses?.[0]?.email_address ||
          "";

        await createUser(user.id, name, primaryEmail);
        logger.info("clerk.webhook.user_created", {
          userId: user.id,
          email: primaryEmail,
        });
        break;
      }

      case "user.updated": {
        const user = evt.data;
        const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "User";
        const primaryEmail =
          user.email_addresses?.find((e) => e.id === user.primary_email_address_id)?.email_address ||
          user.email_addresses?.[0]?.email_address ||
          "";

        await updateUser(user.id, name, primaryEmail);
        logger.info("clerk.webhook.user_updated", {
          userId: user.id,
          email: primaryEmail,
        });
        break;
      }

      case "user.deleted": {
        if (evt.data.id) {
          await deleteUser(evt.data.id);
          logger.info("clerk.webhook.user_deleted", { userId: evt.data.id });
        }
        break;
      }

      default:
        logger.info("clerk.webhook.unhandled_event", { type: eventType });
    }

    return Response.json({ success: true, event: eventType }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Database sync failed";
    logger.error("clerk.webhook.processing_error", {
      type: eventType,
      error: message,
    });
    return Response.json({ error: "Webhook event processing failed", details: message }, { status: 500 });
  }
}
