import { SignJWT, jwtVerify } from "jose";

export interface ConversationTokenPayload {
  userId: string;
  conversationId: string;
  documentIds: string[];
}

function getSecretKey(): Uint8Array {
  const secret =
    process.env.CONVERSATION_TOKEN_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    "docsy-secure-conversation-token-secret-key-minimum-32-chars";
  return new TextEncoder().encode(secret);
}

/**
 * Mint a cryptographically signed HMAC token for a conversation session.
 * Encapsulates verified ownership and document IDs to allow 0ms in-memory
 * authorization on high-frequency streaming turns.
 *
 * @param payload - User ID, Conversation ID, and linked Document IDs
 * @param expiresIn - Token time-to-live (default: 2 hours)
 */
export async function signConversationToken(
  payload: ConversationTokenPayload,
  expiresIn = "2h"
): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    conversationId: payload.conversationId,
    documentIds: payload.documentIds,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

/**
 * Verify a conversation session token in-memory using pure cryptographic CPU validation (<0.05ms).
 * Returns the decoded payload if valid and unexpired, or null if tampered or expired.
 *
 * @param token - Raw JWT string from x-conversation-token header
 */
export async function verifyConversationToken(
  token: string
): Promise<ConversationTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId === "string" &&
      typeof payload.conversationId === "string" &&
      Array.isArray(payload.documentIds)
    ) {
      return {
        userId: payload.userId,
        conversationId: payload.conversationId,
        documentIds: payload.documentIds as string[],
      };
    }
    return null;
  } catch {
    return null;
  }
}
