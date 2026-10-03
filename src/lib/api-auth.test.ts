import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import {
  getConversationTokenContext,
  verifySupabaseWebhookSecret,
  getAuthRouteContext,
} from "./api-auth";
import * as convToken from "./conversation-token";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";

describe("api-auth", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getConversationTokenContext", () => {
    it("returns 401 unauthorized when x-conversation-token header is absent", async () => {
      const req = new NextRequest("http://localhost:3000/api/conversations/conv-1/messages");
      const paramsPromise = Promise.resolve({ id: "conv-1" });

      const result = await getConversationTokenContext(req, paramsPromise);

      expect(result.success).toBe(false);
      expect(result.userId).toBeNull();
      if (!result.success) {
        expect(result.errorResponse.status).toBe(401);
      }
    });

    it("returns 401 when token is valid but conversationId does not match route params", async () => {
      vi.spyOn(convToken, "verifyConversationToken").mockResolvedValueOnce({
        userId: "user-1",
        conversationId: "conv-other",
        documentIds: ["doc-1"],
      });

      const req = new NextRequest("http://localhost:3000/api/conversations/conv-1/messages", {
        headers: { "x-conversation-token": "valid-token" },
      });
      const paramsPromise = Promise.resolve({ id: "conv-1" });

      const result = await getConversationTokenContext(req, paramsPromise);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorResponse.status).toBe(401);
      }
    });

    it("returns success and userId when capability token matches route params", async () => {
      vi.spyOn(convToken, "verifyConversationToken").mockResolvedValueOnce({
        userId: "user-test",
        conversationId: "conv-123",
        documentIds: ["doc-1"],
      });

      const req = new NextRequest("http://localhost:3000/api/conversations/conv-123/messages", {
        headers: { "x-conversation-token": "valid-token" },
      });
      const paramsPromise = Promise.resolve({ id: "conv-123" });

      const result = await getConversationTokenContext(req, paramsPromise);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.userId).toBe("user-test");
        expect(result.params.id).toBe("conv-123");
        expect(result.errorResponse).toBeNull();
      }
    });
  });

  describe("verifySupabaseWebhookSecret", () => {
    it("returns null when SUPABASE_WEBHOOK_SECRET is not configured", () => {
      delete process.env.SUPABASE_WEBHOOK_SECRET;
      const req = new NextRequest("http://localhost:3000/api/webhooks/supabase");
      const res = verifySupabaseWebhookSecret(req);
      expect(res).toBeNull();
    });

    it("returns 401 unauthorized when webhook secret header mismatches", () => {
      process.env.SUPABASE_WEBHOOK_SECRET = "secret-123";
      const req = new NextRequest("http://localhost:3000/api/webhooks/supabase", {
        headers: { "x-supabase-webhook-secret": "wrong-secret" },
      });
      const res = verifySupabaseWebhookSecret(req);
      expect(res).not.toBeNull();
      expect(res?.status).toBe(401);
    });

    it("returns null when webhook secret matches expected header", () => {
      process.env.SUPABASE_WEBHOOK_SECRET = "secret-123";
      const req = new NextRequest("http://localhost:3000/api/webhooks/supabase", {
        headers: { "x-supabase-webhook-secret": "secret-123" },
      });
      const res = verifySupabaseWebhookSecret(req);
      expect(res).toBeNull();
    });
  });

  describe("getAuthRouteContext", () => {
    it("returns 401 when Clerk session has no userId", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as unknown as Awaited<ReturnType<typeof auth>>);
      const paramsPromise = Promise.resolve({ id: "doc-1" });

      const result = await getAuthRouteContext(paramsPromise);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errorResponse.status).toBe(401);
      }
    });

    it("returns success and resolved params when Clerk user is authenticated", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: "clerk_user_99" } as unknown as Awaited<ReturnType<typeof auth>>);
      const paramsPromise = Promise.resolve({ id: "doc-1" });

      const result = await getAuthRouteContext(paramsPromise);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.userId).toBe("clerk_user_99");
        expect(result.params.id).toBe("doc-1");
      }
    });
  });
});
