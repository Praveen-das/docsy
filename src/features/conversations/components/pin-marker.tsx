import React from "react";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PinMarkerProps {
  className?: string;
}

export function PinMarker({ className }: PinMarkerProps) {
  return (
    <span
      className={cn("inline-flex items-center text-[#525f7a] p-0.5", className)}
      title="Pinned conversation"
      aria-label="Pinned conversation"
    >
      <Pin className="h-3.5 w-3.5" />
    </span>
  );
}
