import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { buildStatusUpdatePayload } from "./document-status.helper";

describe("document-status.helper", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-03T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds minimal status update payload with current timestamp", () => {
    const payload = buildStatusUpdatePayload("EXTRACTING");

    expect(payload.status).toBe("EXTRACTING");
    expect(payload.updatedAt).toEqual(new Date("2026-10-03T10:00:00.000Z"));
    expect(payload.error).toBeUndefined();
    expect(payload.processingProgress).toBeUndefined();
  });

  it("includes progress, error, and page/chunk metadata when provided", () => {
    const payload = buildStatusUpdatePayload("FAILED", {
      error: "PDF parsing error",
      processingProgress: 45,
      metadata: { pageCount: 12, chunkCount: 36 },
    });

    expect(payload.status).toBe("FAILED");
    expect(payload.error).toBe("PDF parsing error");
    expect(payload.processingProgress).toBe(45);
    expect(payload.pageCount).toBe(12);
    expect(payload.chunkCount).toBe(36);
  });
});
