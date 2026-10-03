import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validates that a redirect URL is a secure Stripe host or relative URL.
 * Prevents CWE-601 open redirects and javascript: URI execution.
 */
export function isSafeStripeRedirectUrl(url: string): boolean {
  try {
    const base = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const parsed = new URL(url, base);
    if (parsed.protocol !== "https:") return false;
    return (
      parsed.hostname === "checkout.stripe.com" ||
      parsed.hostname === "billing.stripe.com" ||
      parsed.hostname.endsWith(".stripe.com")
    );
  } catch {
    return false;
  }
}

