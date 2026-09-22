import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

/**
 * Singleton StripeClient instance.
 *
 * Per Stripe best-practices: always instantiate StripeClient and call methods
 * on the instance — never use the deprecated global API key pattern.
 *
 * Uses the latest API version (2026-08-26.dahlia).
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-08-26.dahlia" as Stripe.LatestApiVersion,
  typescript: true,
  appInfo: {
    name: "Docsy AI",
    version: "1.0.0",
  },
});
