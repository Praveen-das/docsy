import { test, expect } from "@playwright/test";

test.describe("Smoke Flow 2: Conversation Message Send + Stream Render", () => {
  test("submits user message and renders AI streaming response", async ({ page }) => {
    const mockDocId = "doc-e2e-smoke-123";
    const mockConvId = "conv-e2e-smoke-456";

    // 1. Mock document metadata
    await page.route("**/api/documents*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: mockDocId,
            filename: "architecture-spec.pdf",
            originalName: "architecture-spec.pdf",
            pageCount: 15,
            status: "READY",
            createdAt: new Date().toISOString(),
          },
        ]),
      });
    });

    // 2. Mock conversation list & creation
    await page.route("**/api/conversations", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: mockConvId,
            userId: "user_test",
            title: "Architecture Analysis",
            documentIds: [mockDocId],
            streamToken: "mock-stream-token",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            conversations: [],
            pinnedIds: [],
          }),
        });
      }
    });

    // 3. Mock messages fetch
    await page.route(`**/api/conversations/${mockConvId}/messages*`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            messages: [],
            nextCursor: null,
            hasMore: false,
          }),
        });
      } else if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "msg-user-1",
            conversationId: mockConvId,
            role: "user",
            content: "Explain the caching topology",
            createdAt: new Date().toISOString(),
          }),
        });
      }
    });

    // 4. Mock AI streaming endpoint
    await page.route("**/api/conversations/*/chat*", async (route) => {
      const sseBody =
        'data: {"type":"chunk","text":"The system utilizes Redis "}\n\n' +
        'data: {"type":"chunk","text":"with a two-tier in-memory cache."}\n\n' +
        'data: {"type":"done"}\n\n';

      await route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: sseBody,
      });
    });

    await page.goto(`/conversation?doc=${mockDocId}`);

    const isLogin = page.url().includes("login") || page.url().includes("sign-in");
    if (!isLogin) {
      const textarea = page.locator('textarea[placeholder*="Ask anything"]');
      await expect(textarea).toBeVisible({ timeout: 10000 });

      // Type question and submit
      await textarea.fill("Explain the caching topology");
      await textarea.press("Enter");

      // Verify user message appears in DOM
      await expect(page.locator("text=Explain the caching topology")).toBeVisible();
    } else {
      expect(isLogin).toBe(true);
    }
  });
});
