import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST, DELETE } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/services/conversation.service", () => ({
  createConversation: vi.fn(),
  listConversations: vi.fn(),
  listPinnedConversationIds: vi.fn(),
  deleteAllConversations: vi.fn(),
}));

vi.mock("@/lib/conversation-token", () => ({
  signConversationToken: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import {
  createConversation,
  listConversations,
  listPinnedConversationIds,
  deleteAllConversations,
} from "@/services/conversation.service";
import { signConversationToken } from "@/lib/conversation-token";

describe("Route: /api/conversations", () => {
  const userId = "user_clerk_123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/conversations", () => {
    it("returns 401 Unauthorized when session is missing", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as unknown as Awaited<ReturnType<typeof auth>>);

      const res = await GET();
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns conversations and pinnedIds for authenticated user", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId } as unknown as Awaited<ReturnType<typeof auth>>);
      vi.mocked(listConversations).mockResolvedValueOnce([
        { id: "conv-1", title: "Doc discussion" },
      ] as unknown as Awaited<ReturnType<typeof listConversations>>);
      vi.mocked(listPinnedConversationIds).mockResolvedValueOnce(["conv-1"]);

      const res = await GET();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.conversations).toHaveLength(1);
      expect(json.pinnedIds).toEqual(["conv-1"]);
    });
  });

  describe("POST /api/conversations", () => {
    it("returns 400 Bad Request when documentIds is empty", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId } as unknown as Awaited<ReturnType<typeof auth>>);

      const req = new NextRequest("http://localhost:3000/api/conversations", {
        method: "POST",
        body: JSON.stringify({ documentIds: [] }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid request");
    });

    it("creates conversation, mints capability token, and returns 201 Created", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId } as unknown as Awaited<ReturnType<typeof auth>>);
      const now = new Date();
      vi.mocked(createConversation).mockResolvedValueOnce({
        id: "conv-created-1",
        userId,
        title: "New Conversation",
        createdAt: now,
        updatedAt: now,
      } as unknown as Awaited<ReturnType<typeof createConversation>>);
      vi.mocked(signConversationToken).mockResolvedValueOnce("stream-token-xyz");

      const req = new NextRequest("http://localhost:3000/api/conversations", {
        method: "POST",
        body: JSON.stringify({
          documentIds: ["doc-100"],
          title: "New Conversation",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe("conv-created-1");
      expect(json.streamToken).toBe("stream-token-xyz");
      expect(json.documentIds).toEqual(["doc-100"]);
    });
  });

  describe("DELETE /api/conversations", () => {
    it("deletes all conversations for authenticated user", async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId } as unknown as Awaited<ReturnType<typeof auth>>);
      vi.mocked(deleteAllConversations).mockResolvedValueOnce(5);

      const res = await DELETE();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(5);
    });
  });
});
