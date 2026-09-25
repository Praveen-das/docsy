"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FeedbackModal } from "@/features/feedback/components/feedback-modal";

/**
 * /feedback — Quick feedback submission modal.
 */
export default function FeedbackPage() {
  const router = useRouter();

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return <FeedbackModal isOpen={true} onClose={handleClose} />;
}
