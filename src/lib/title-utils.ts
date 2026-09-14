/**
 * Checks if a given conversation title matches default / automatic placeholder naming
 * or matches the initial user prompt assigned at conversation creation.
 */
export function isDefaultTitle(title: string | null | undefined, initialPrompt?: string): boolean {
  if (!title || !title.trim()) return true;
  const normalized = title.trim().toLowerCase();
  if (
    normalized === "new conversation" ||
    normalized === "conversation" ||
    /^conversation\s+\d+$/i.test(normalized) ||
    /^new conversation\s+\d+$/i.test(normalized)
  ) {
    return true;
  }

  if (initialPrompt) {
    const trimmedPrompt = initialPrompt.trim().toLowerCase();
    const fallback = generateFallbackTitle(initialPrompt).toLowerCase();
    if (normalized === trimmedPrompt || normalized === fallback) {
      return true;
    }
  }

  return false;
}

/**
 * Fallback generator using a sanitized excerpt of the user's initial prompt.
 */
export function generateFallbackTitle(userPrompt: string): string {
  const cleanSnippet = userPrompt
    .replace(/[?.,!*"#`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanSnippet) return "New Conversation";
  return cleanSnippet.length > 36 ? `${cleanSnippet.slice(0, 36)}...` : cleanSnippet;
}
