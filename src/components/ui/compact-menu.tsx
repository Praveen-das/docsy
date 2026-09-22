"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LucideIcon, ChevronRight } from "lucide-react";
import { GlowContainer } from "@/components/ui/glow-container";
import { cn } from "@/lib/utils";

export type CompactMenuItemVariant = "default" | "warning" | "accent" | "danger";

export interface CompactMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: CompactMenuItemVariant;
  showChevron?: boolean;
  disabled?: boolean;
}

export interface CompactMenuSection {
  items: CompactMenuItem[];
}

export interface CompactMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sections?: CompactMenuSection[];
  destructiveAction?: CompactMenuItem;
  children?: React.ReactNode;
  className?: string;
  width?: string;
  align?: "left" | "right";
}

const variantItemStyles: Record<
  CompactMenuItemVariant,
  {
    button: string;
    icon: string;
    chevron: string;
  }
> = {
  default: {
    button: "text-[#8f9bb3] hover:bg-white/[0.05] hover:text-[#f8fafc]",
    icon: "text-[#828ea7] group-hover:text-[#c7d2fe]",
    chevron: "text-[#4a5268] group-hover:text-[#94a3b8]",
  },
  warning: {
    button: "text-amber-300 hover:bg-amber-500/[0.08]",
    icon: "text-amber-300",
    chevron: "text-amber-400/40 group-hover:text-amber-300",
  },
  accent: {
    button: "text-indigo-300 hover:bg-indigo-500/[0.08]",
    icon: "text-indigo-300",
    chevron: "text-indigo-400/40 group-hover:text-indigo-300",
  },
  danger: {
    button: "text-rose-400 hover:bg-rose-500/[0.08]",
    icon: "text-rose-400",
    chevron: "text-rose-400/40 group-hover:text-rose-300",
  },
};

/**
 * Reusable obsidian glassmorphic compact dropdown menu matching header-user-menu aesthetics.
 * Features specular light rim, ambient diffuse glows, smooth pill hover states, and frosted dividers.
 *
 * Portals the backdrop + menu to document.body to escape parent stacking contexts.
 */
export function CompactMenu({
  isOpen,
  onClose,
  sections,
  destructiveAction,
  children,
  className,
  width = "w-48",
  align = "right",
}: CompactMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; right: number } | null>(null);

  // Measure anchor position when menu opens
  useEffect(() => {
    if (!isOpen || !anchorRef.current) {
      setPos(null);
      return;
    }

    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom,
      left: rect.left,
      right: window.innerWidth - rect.right,
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Always render anchor in-place for measurement
  return (
    <>
      <div ref={anchorRef} className="absolute inset-0 pointer-events-none" />
      {isOpen &&
        pos &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[999] cursor-default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose?.();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />

            {/* Menu panel */}
            <div
              className="fixed z-[1000]"
              style={{
                top: pos.top + 4,
                ...(align === "right" ? { right: pos.right } : { left: pos.left }),
              }}
            >
              <GlowContainer
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "!p-1.5 !rounded-2xl will-change-transform animate-in fade-in zoom-in-95 duration-150 shadow-2xl",
                  width,
                )}
              >
                {/* Custom children content if provided */}
                {children}

                {/* Structured Sections */}
                {sections && sections.length > 0 && (
                  <div className="space-y-1.5 relative z-10">
                    {sections.map((section, sIdx) => (
                      <React.Fragment key={sIdx}>
                        {sIdx > 0 && <div className="my-1.5 h-px w-full bg-white/[0.06]" />}
                        <div className="space-y-0.5">
                          {section.items.map((item, iIdx) => {
                            const Icon = item.icon;
                            const variant = item.variant || "default";
                            const style = variantItemStyles[variant];
                            const showChevron = item.showChevron ?? true;

                            return (
                              <button
                                key={iIdx}
                                type="button"
                                disabled={item.disabled}
                                onClick={() => {
                                  onClose();
                                  item.onClick?.();
                                }}
                                className={cn(
                                  "group flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
                                  style.button,
                                )}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {Icon && (
                                    <Icon
                                      className={cn("h-3.5 w-3.5 shrink-0 stroke-[1.85] transition-colors", style.icon)}
                                    />
                                  )}
                                  <span className="truncate">{item.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Destructive Action Box (Sign Out / Delete Pattern) */}
                {destructiveAction && (
                  <div className="mt-1.5 relative z-10">
                    <div className="mb-1.5 h-px w-full bg-white/[0.06]" />
                    <button
                      type="button"
                      disabled={destructiveAction.disabled}
                      onClick={() => {
                        onClose();
                        destructiveAction.onClick?.();
                      }}
                      className="group flex w-full items-center gap-2.5 rounded-xl border border-rose-500/15 bg-rose-500/[0.05] backdrop-blur-md px-2.5 py-1.5 text-xs font-medium text-[#f87171] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] transition-all duration-150 hover:bg-rose-500/[0.12] hover:border-rose-500/30 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {destructiveAction.icon && (
                        <destructiveAction.icon className="h-3.5 w-3.5 text-[#f87171] stroke-[1.85] group-hover:translate-x-0.5 transition-transform" />
                      )}
                      <span>{destructiveAction.label}</span>
                    </button>
                  </div>
                )}
              </GlowContainer>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
