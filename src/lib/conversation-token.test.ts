import { describe, it, expect } from "vitest";
import {
  signConversationToken,
  verifyConversationToken,
  ConversationTokenPayload,
} from "./conversation-token";

describe("conversation-token", () => {
  const samplePayload: ConversationTokenPayload = {
    userId: "user_test_123",
    conversationId: "conv_test_456",
    documentIds: ["doc_1", "doc_2"],
  };

  it("mints and successfully verifies a valid HMAC capability token", async () => {
    const token = await signConversationToken(samplePayload);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const verified = await verifyConversationToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(samplePayload.userId);
    expect(verified?.conversationId).toBe(samplePayload.conversationId);
    expect(verified?.documentIds).toEqual(samplePayload.documentIds);
  });

  it("rejects an expired token", async () => {
    // Generate a token that expires in 0s
    const token = await signConversationToken(samplePayload, "0s");
    // Wait 50ms to ensure expiration
    await new Promise((resolve) => setTimeout(resolve, 50));

    const verified = await verifyConversationToken(token);
    expect(verified).toBeNull();
  });

  it("rejects a tampered token signature", async () => {
    const token = await signConversationToken(samplePayload);
    const parts = token.split(".");
    // Tamper with payload segment
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...samplePayload, userId: "hacker" })
    ).toString("base64url");
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const verified = await verifyConversationToken(tamperedToken);
    expect(verified).toBeNull();
  });

  it("returns null for completely invalid or malformed strings", async () => {
    expect(await verifyConversationToken("")).toBeNull();
    expect(await verifyConversationToken("not.a.jwt")).toBeNull();
    expect(await verifyConversationToken("randomgibberish")).toBeNull();
  });
});
