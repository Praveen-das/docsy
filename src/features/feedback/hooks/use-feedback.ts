"use client";

import { useMutation } from "@tanstack/react-query";
import type { FeedbackCategory, FeedbackSubmission } from "@/features/feedback/types";

export interface SubmitFeedbackInput {
  message: string;
  category: FeedbackCategory;
  files: File[];
}

/**
 * Submits feedback as FormData (supports real file uploads).
 */
export function useSubmitFeedback() {
  return useMutation({
    mutationFn: async (input: SubmitFeedbackInput) => {
      const formData = new FormData();
      formData.append("message", input.message);
      formData.append("category", input.category);

      for (const file of input.files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to submit feedback");
      }

      return res.json() as Promise<FeedbackSubmission>;
    },
  });
}
