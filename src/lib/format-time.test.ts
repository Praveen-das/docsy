import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeTime, formatDate, formatTime } from "./format-time";

describe("format-time", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-03T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatRelativeTime", () => {
    it("returns empty string when input is falsy", () => {
      expect(formatRelativeTime("")).toBe("");
    });

    it("returns 'Just now' when timestamp is within 45 seconds", () => {
      const thirtySecondsAgo = new Date("2026-10-03T11:59:30.000Z").toISOString();
      expect(formatRelativeTime(thirtySecondsAgo)).toBe("Just now");
    });

    it("formats relative minutes correctly", () => {
      const fiveMinutesAgo = new Date("2026-10-03T11:55:00.000Z").toISOString();
      expect(formatRelativeTime(fiveMinutesAgo)).toBe("5 minutes ago");
    });

    it("formats relative hours correctly", () => {
      const twoHoursAgo = new Date("2026-10-03T10:00:00.000Z").toISOString();
      expect(formatRelativeTime(twoHoursAgo)).toBe("2 hours ago");
    });
  });

  describe("formatDate and formatTime", () => {
    it("returns empty string on empty input", () => {
      expect(formatDate("")).toBe("");
      expect(formatTime("")).toBe("");
    });

    it("formats deterministic date and time", () => {
      const iso = "2026-10-03T12:30:00.000Z";
      expect(formatDate(iso)).toContain("2026");
      expect(formatTime(iso)).toBeTruthy();
    });
  });
});
