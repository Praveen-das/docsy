import { describe, it, expect } from "vitest";
import { PLANS, getDailyQueryLimit } from "./stripe-plans";

describe("stripe-plans", () => {
  it("defines accurate tier limits for free and pro plans", () => {
    expect(PLANS.free.dailyQueryLimit).toBe(25);
    expect(PLANS.free.maxDocuments).toBe(5);
    expect(PLANS.free.monthlyPrice).toBeNull();

    expect(PLANS.pro.dailyQueryLimit).toBe(200);
    expect(PLANS.pro.maxDocuments).toBe(200);
    expect(PLANS.pro.monthlyPrice).toBe(19);
  });

  it("returns daily query limits matching getDailyQueryLimit helper", () => {
    expect(getDailyQueryLimit("free")).toBe(25);
    expect(getDailyQueryLimit("pro")).toBe(200);
  });
});
