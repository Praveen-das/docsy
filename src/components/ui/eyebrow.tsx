import React from "react";
import { cn } from "@/lib/utils";

export interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: "div" | "span" | "p";
}

export function Eyebrow({
  children,
  className,
  as: Component = "div",
  ...props
}: EyebrowProps) {
  return (
    <Component className={cn("inline-block select-none", className)} {...props}>
      <span className="text-xs sm:text-[13px] font-bold tracking-[0.22em] text-[#818cf8] uppercase">
        {children}
      </span>
    </Component>
  );
}
