import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCustomerInvoices, getCustomerPaymentMethod } from "@/services/subscription.service";
import { logger } from "@/lib/logger";

/**
 * GET /api/stripe/invoices
 *
 * Returns past tax invoices and default payment method details
 * for the authenticated user.
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [invoices, paymentMethod] = await Promise.all([
      getCustomerInvoices(userId),
      getCustomerPaymentMethod(userId),
    ]);

    return NextResponse.json({
      invoices,
      paymentMethod,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch billing details";
    logger.error("stripe.invoices.failed", { userId, error: message });
    return NextResponse.json({ error: message, invoices: [], paymentMethod: null }, { status: 500 });
  }
}
