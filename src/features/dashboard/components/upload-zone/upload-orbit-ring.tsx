"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText } from "lucide-react";

export interface UploadOrbitRingProps {
  onTriggerUpload: (e?: React.SyntheticEvent) => void;
  mousePos?: { x: number; y: number };
  /** Raw viewport pointer coords (clientX/Y) for per-pill repulsion */
  pillOffset?: { x: number; y: number };
  isHovered?: boolean;
}

interface OrbitPillProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconGlowColor: string;
  onClick?: (e?: React.SyntheticEvent) => void;
  className?: string;
  /** Raw viewport pointer coords */
  pointerPos: { x: number; y: number };
  isHovered: boolean;
}

/**
 * Magnetic repulsion pill: pushes AWAY from cursor.
 * Closer the pointer → stronger the push (max 8px).
 * Each pill measures from its own center independently.
 */
function OrbitPill({
  title,
  subtitle,
  icon,
  iconGlowColor,
  onClick,
  className = "",
  pointerPos,
  isHovered,
}: OrbitPillProps) {
  const pillRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);

  // Cache pill center on hover entry (avoids reflow per frame)
  useEffect(() => {
    if (isHovered && pillRef.current) {
      const r = pillRef.current.getBoundingClientRect();
      centerRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    } else {
      centerRef.current = null;
    }
  }, [isHovered]);

  let tx = 0;
  let ty = 0;

  if (isHovered && centerRef.current) {
    const dx = pointerPos.x - centerRef.current.x;
    const dy = pointerPos.y - centerRef.current.y;
    const dist = Math.hypot(dx, dy);

    // Repulsion zone: 200px radius. Closer = stronger push.
    const maxRadius = 200;
    const maxTravel = 8;

    if (dist > 0 && dist < maxRadius) {
      // Inverse strength: full push at dist=0, zero at dist=maxRadius
      const strength = 1 - dist / maxRadius;
      // Smooth ease-in so very far distances don't jitter
      const eased = strength * strength;
      const travel = maxTravel * eased;

      // Push AWAY from cursor (negate the direction vector)
      tx = -(dx / dist) * travel;
      ty = -(dy / dist) * travel;
    }
  }

  return (
    <div
      ref={pillRef}
      onClick={onClick}
      style={{
        transform: `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`,
        transformOrigin: "center center",
        transition: isHovered
          ? "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)"
          : "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: isHovered ? "transform" : "auto",
      }}
      className={`flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4.5 sm:py-2.5 rounded-full bg-[#0a0d17]/70 sm:bg-[#0a0d17]/40 border border-dashed border-white/[0.14] sm:border-white/[0.1] backdrop-blur-xl transition-all duration-200 cursor-pointer active:scale-95 group select-none shadow-sm shadow-black/40 ${className}`}
    >
      {/* Icon with soft ambient aura */}
      <div className="relative flex items-center justify-center shrink-0 w-4 h-4 sm:w-5 sm:h-5">
        <div
          className={`absolute -inset-1 rounded-full ${iconGlowColor} blur-md pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity`}
        />
        {icon}
      </div>

      {/* Typography */}
      <div className="flex flex-col text-left pr-0.5">
        <span className="text-[12px] sm:text-[13.5px] font-semibold text-white leading-tight tracking-[-0.01em]">
          {title}
        </span>
        <span className="text-[10px] sm:text-[11.5px] text-slate-400 font-normal leading-tight mt-0.5 tracking-[-0.005em]">
          {subtitle}
        </span>
      </div>
    </div>
  );
}

export function UploadOrbitRing({
  onTriggerUpload,
  mousePos = { x: 0, y: 0 },
  pillOffset = { x: 0, y: 0 },
  isHovered = false,
}: UploadOrbitRingProps) {
  const router = useRouter();

  const transitionStyle = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <>
      {/* Dotted Elliptical Track & Glow Nodes with very subtle parallax */}
      <div
        aria-hidden="true"
        style={{
          transform: `translate3d(${mousePos.x * 0.08}px, ${mousePos.y * 0.08}px, 0)`,
          transition: transitionStyle,
          willChange: isHovered ? "transform" : "auto",
        }}
        className="absolute inset-0 pointer-events-none z-0 overflow-visible"
      >
        <svg
          viewBox="0 0 500 440"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dotted Elliptical Track */}
          <ellipse
            cx="250"
            cy="218"
            rx="246"
            ry="198"
            stroke="rgba(255, 255, 255, 0.09)"
            strokeDasharray="3 5"
            strokeWidth="1"
          />

          {/* Node 1: Top Glow Dot (Ask) */}
          <circle cx="230" cy="21" r="3.5" fill="#c084fc" className="drop-shadow-[0_0_8px_rgba(192,132,252,0.95)]" />

          {/* Node 2: Right Glow Dot (Discover) */}
          <circle cx="474" cy="140" r="3.5" fill="#a855f7" className="drop-shadow-[0_0_8px_rgba(168,85,247,0.95)]" />

          {/* Node 3: Bottom-Right Glow Dot (Upload) */}
          <circle cx="452" cy="330" r="3.5" fill="#60a5fa" className="drop-shadow-[0_0_8px_rgba(96,165,250,0.95)]" />
        </svg>
      </div>

      {/* Orbit Pill 1: Ask (Top) */}
      <OrbitPill
        title="Ask"
        subtitle="Get instant answers"
        iconGlowColor="bg-purple-500/30"
        onClick={() => router.push("/conversations")}
        pointerPos={pillOffset}
        isHovered={isHovered}
        className="absolute -top-3 left-[8%] sm:left-[17%] z-20"
        icon={
          <svg
            viewBox="0 0 24 24"
            className="relative z-10 w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#c084fc] drop-shadow-[0_0_8px_rgba(192,132,252,0.85)] shrink-0 transition-transform group-hover:scale-105"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2.5C12 7.6 7.6 12 2.5 12C7.6 12 12 16.4 12 21.5C12 16.4 16.4 12 21.5 12C16.4 12 12 7.6 12 2.5Z" />
          </svg>
        }
      />

      {/* Orbit Pill 2: Discover (Top-Right) */}
      <OrbitPill
        title="Discover"
        subtitle="Find key insights"
        iconGlowColor="bg-indigo-500/30"
        onClick={() => router.push("/documents")}
        pointerPos={pillOffset}
        isHovered={isHovered}
        className="absolute top-[10%] -right-2 xs:-right-4 sm:-right-9 z-20"
        icon={
          <Search
            className="relative z-10 w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#a78bfa] drop-shadow-[0_0_8px_rgba(167,139,250,0.85)] shrink-0 transition-transform group-hover:scale-105"
            strokeWidth={2}
          />
        }
      />

      {/* Orbit Pill 3: Upload (Bottom-Right) */}
      <OrbitPill
        title="Upload"
        subtitle="Start a conversation"
        iconGlowColor="bg-blue-500/30"
        onClick={onTriggerUpload}
        pointerPos={pillOffset}
        isHovered={isHovered}
        className="absolute bottom-[4%] -right-1 xs:-right-3 sm:-right-7 z-20"
        icon={
          <FileText
            className="relative z-10 w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.85)] shrink-0 transition-transform group-hover:scale-105"
            strokeWidth={2}
          />
        }
      />
    </>
  );
}

