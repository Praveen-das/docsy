import { describe, it, expect } from "vitest";
import { isDefaultTitle, generateFallbackTitle } from "./title-utils";

describe("title-utils", () => {
  describe("isDefaultTitle", () => {
    it("identifies placeholder and generic conversation titles", () => {
      expect(isDefaultTitle(null)).toBe(true);
      expect(isDefaultTitle("")).toBe(true);
      expect(isDefaultTitle("   ")).toBe(true);
      expect(isDefaultTitle("New Conversation")).toBe(true);
      expect(isDefaultTitle("new conversation")).toBe(true);
      expect(isDefaultTitle("Conversation 1")).toBe(true);
      expect(isDefaultTitle("new conversation 42")).toBe(true);
    });

    it("identifies when title matches initial prompt or generated fallback", () => {
      const prompt = "What are the contractual terms?";
      const fallback = generateFallbackTitle(prompt);

      expect(isDefaultTitle(fallback, prompt)).toBe(true);
      expect(isDefaultTitle(prompt, prompt)).toBe(true);
    });

    it("returns false for customized user titles", () => {
      expect(isDefaultTitle("Q3 Financial Analysis")).toBe(false);
      expect(isDefaultTitle("Vendor Security Architecture")).toBe(false);
    });
  });

  describe("generateFallbackTitle", () => {
    it("returns 'New Conversation' when prompt contains only punctuation or whitespace", () => {
      expect(generateFallbackTitle("")).toBe("New Conversation");
      expect(generateFallbackTitle("   ??? !!! ")).toBe("New Conversation");
    });

    it("sanitizes special characters and collapses excess whitespace", () => {
      const result = generateFallbackTitle('What   is "Docsy AI"?? *important*');
      expect(result).toBe("What is Docsy AI important");
    });

    it("truncates prompt exceeding 36 characters with ellipsis", () => {
      const longPrompt = "This is an extremely long user query asking about complex system constraints";
      const result = generateFallbackTitle(longPrompt);

      expect(result.endsWith("...")).toBe(true);
      expect(result.length).toBe(39); // 36 chars + 3 dots
    });
  });
});
