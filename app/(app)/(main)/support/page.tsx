"use client";

import React from "react";
import { FAQSection } from "@/features/support/components/faq-section";

/**
 * /support — Docsy Enterprise Knowledge & FAQ Hub.
 *
 * Provides:
 * - Interactive Knowledge Base & FAQ Search with helpfulness voting and category filtering
 */
export default function SupportPage() {
  return (
    <div className="relative z-10 px-4 sm:px-8 py-7 max-w-[1400px] mt-8 lg:mt-8 mb-20 mx-auto space-y-8 select-none">
      <FAQSection />
    </div>
  );
}
