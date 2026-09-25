export function extractClerkErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "errors" in err &&
    Array.isArray((err as { errors: { message?: string }[] }).errors)
  ) {
    const firstError = (err as { errors: { message?: string }[] }).errors[0];
    if (firstError?.message) {
      return firstError.message;
    }
  }
  return fallback;
}
