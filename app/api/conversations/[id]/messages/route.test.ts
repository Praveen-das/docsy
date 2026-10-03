import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "./route";

// Mock conversation service and auth context
vi.mock("@/services/conversation.service", () => ({
  getPaginatedMessages: vi.fn(),
  persistMessage: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  getConversationTokenContext: vi.fn(),
}));

import { getPaginatedMessages, persistMessage } from "@/services/conversation.service";
import { getConversationTokenContext } from "@/lib/api-auth";

describe("Route: /api/conversations/[id]/messages", () => {
  const convId = "conv_test_123";
  const userId = "user_test_456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET handler", () => {
    it("returns 401 when getConversationTokenContext fails", async () => {
      vi.mocked(getConversationTokenContext).mockResolvedValueOnce({
        success: false,
        userId: null,
        params: null,
        errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      });

      const req = new NextRequest(`http://localhost:3000/api/conversations/${convId}/messages`);
      const res = await GET(req, { params: Promise.resolve({ id: convId }) });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 200 with formatted paginated messages and pagination cursors", async () => {
      vi.mocked(getConversationTokenContext).mockResolvedValueOnce({
        success: true,
        userId,
        params: { id: convId },
        errorResponse: null,
      });

      const now = new Date();
      vi.mocked(getPaginatedMessages).mockResolvedValueOnce({
        messages: [
          {
            id: "msg_1",
            conversationId: convId,
            role: "user",
            content: "Hello docsy",
            sources: [],
            createdAt: now,
            updatedAt: now,
          } as unknown as Awaited<ReturnType<typeof getPaginatedMessages>>["messages"][number],
        ],
        nextCursor: "cursor_abc",
        hasMore: true,
      });

      const req = new NextRequest(
        `http://localhost:3000/api/conversations/${convId}/messages?limit=15`
      );
      const res = await GET(req, { params: Promise.resolve({ id: convId }) });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.messages).toHaveLength(1);
      expect(json.messages[0].id).toBe("msg_1");
      expect(json.messages[0].createdAt).toBe(now.toISOString());
      expect(json.nextCursor).toBe("cursor_abc");
      expect(json.hasMore).toBe(true);

      expect(getPaginatedMessages).toHaveBeenCalledWith(userId, convId, {
        limit: 15,
        cursor: undefined,
      });
    });
  });

  describe("POST handler", () => {
    it("returns 401 when unauthenticated", async () => {
      vi.mocked(getConversationTokenContext).mockResolvedValueOnce({
        success: false,
        userId: null,
        params: null,
        errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      });

      const req = new NextRequest(`http://localhost:3000/api/conversations/${convId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: "Valid content" }),
      });
      const res = await POST(req, { params: Promise.resolve({ id: convId }) });

      expect(res.status).toBe(401);
    });

    it("returns 400 Bad Request when message content is empty", async () => {
      vi.mocked(getConversationTokenContext).mockResolvedValueOnce({
        success: true,
        userId,
        params: { id: convId },
        errorResponse: null,
      });

      const req = new NextRequest(`http://localhost:3000/api/conversations/${convId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: "" }),
      });
      const res = await POST(req, { params: Promise.resolve({ id: convId }) });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid message");
      expect(persistMessage).not.toHaveBeenCalled();
    });

    it("returns 201 Created and persists message with valid payload", async () => {
      vi.mocked(getConversationTokenContext).mockResolvedValueOnce({
        success: true,
        userId,
        params: { id: convId },
        errorResponse: null,
      });

      const now = new Date();
      vi.mocked(persistMessage).mockResolvedValueOnce({
        id: "msg_new_1",
        conversationId: convId,
        role: "user",
        content: "What does section 3 state?",
        sources: [],
        createdAt: now,
        updatedAt: now,
      } as unknown as Awaited<ReturnType<typeof persistMessage>>);

      const req = new NextRequest(`http://localhost:3000/api/conversations/${convId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: "What does section 3 state?" }),
      });
      const res = await POST(req, { params: Promise.resolve({ id: convId }) });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.id).toBe("msg_new_1");
      expect(json.role).toBe("user");
      expect(json.content).toBe("What does section 3 state?");
      expect(json.createdAt).toBe(now.toISOString());
    });
  });
});
