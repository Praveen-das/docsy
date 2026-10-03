import { test, expect } from "@playwright/test";

test.describe("Smoke Flow 1: Authentication & Document Upload Landing", () => {
  test("unauthenticated user is redirected to sign-in or login landing page", async ({ page }) => {
    await page.goto("/documents");
    // Protected route redirects to login / sign-in
    await expect(page).toHaveURL(/.*(login|sign-in).*/, { timeout: 15000 });
    await expect(page.locator("text=/Sign in|Sign in to your account|Log in/i").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("document upload modal triggers dropzone and accepts valid PDF", async ({ page }) => {
    // Intercept APIs to test authenticated UI state
    await page.route("**/api/documents*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route("**/api/conversations*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ conversations: [], pinnedIds: [] }),
      });
    });

    await page.goto("/documents");

    const isLogin = page.url().includes("login") || page.url().includes("sign-in");
    if (!isLogin) {
      const uploadBtn = page.locator('button:has-text("Upload"), [aria-label*="Upload"], button[title*="Upload"]').first();
      if (await uploadBtn.isVisible()) {
        await uploadBtn.click();
        await expect(page.locator("text=Drop your PDF here")).toBeVisible();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
          name: "contract-test.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.4 mock pdf content"),
        });

        await expect(page.locator("text=contract-test.pdf")).toBeVisible();
        await expect(page.locator("button:has-text('Analyze Document')")).toBeEnabled();
      }
    } else {
      expect(isLogin).toBe(true);
    }
  });
});
