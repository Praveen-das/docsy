import { cn } from "@/lib/utils";
import React from "react";

function BottomGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-none h-1/2 select-none overflow-hidden z-0 will-change-transform",
        className,
      )}
    >
      <div className="w-full h-full hero-bottom-glow opacity-30" />
    </div>
  );
}

export default BottomGlow;
