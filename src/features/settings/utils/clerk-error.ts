export function extractClerkErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "errors" in err &&
    Array.isArray((err as { errors: { message?: string; longMessage?: string }[] }).errors)
  ) {
    const firstError = (err as { errors: { message?: string; longMessage?: string }[] }).errors[0];
    if (firstError?.longMessage) {
      return firstError.longMessage;
    }
    if (firstError?.message) {
      return firstError.message;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
