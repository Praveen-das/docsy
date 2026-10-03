import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/services/conversation.service", () => ({
  getConversationCounts: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { getConversationCounts } from "@/services/conversation.service";

describe("Route: /api/conversations/counts", () => {
  const userId = "user_clerk_123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 Unauthorized when session is missing", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as unknown as Awaited<ReturnType<typeof auth>>);

    const res = await GET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns total and per-document counts for authenticated user", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId } as unknown as Awaited<ReturnType<typeof auth>>);
    vi.mocked(getConversationCounts).mockResolvedValueOnce({
      total: 5,
      byDocument: { "doc-1": 3, "doc-2": 2 },
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(5);
    expect(json.byDocument).toEqual({ "doc-1": 3, "doc-2": 2 });
  });
});
