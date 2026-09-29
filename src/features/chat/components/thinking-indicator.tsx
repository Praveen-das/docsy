import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThinkingIndicatorProps {
  className?: string;
  label?: string;
}

export function ThinkingIndicator({ className, label = "Thinking..." }: ThinkingIndicatorProps) {
  return (
    <span className={cn("flex items-center gap-1 text-[11px] text-indigo-400 font-medium", className)}>
      <Loader2 className="h-3 w-3 animate-spin" />
      {label}
    </span>
  );
}
