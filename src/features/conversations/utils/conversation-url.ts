/**
 * Constructs relative path for a conversation and optional associated document.
 */
export function getConversationPath(conversationId?: string | null, documentId?: string | null): string {
  console.log({ conversationId, documentId });
  if (documentId && conversationId) {
    return `/conversation?doc=${documentId}&conv=${conversationId}`;
  }
  if (conversationId) {
    return `/conversation?conv=${conversationId}`;
  }
  if (documentId) {
    return `/conversation?doc=${documentId}`;
  }
  return "/conversation";
}

export const getConversationUrl = getConversationPath;
