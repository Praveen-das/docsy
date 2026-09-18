"use client";

import React, { useState } from "react";
import { FileText, MessageCircle, ShieldCheck, Upload } from "lucide-react";
import { useSpring } from "react-spring";
import { GradientOrb } from "@/components/ui/gradient-orb";

export interface DashboardHeroProps {
  onOpenUpload: () => void;
}

const HERO_FEATURES = [
  {
    icon: FileText,
    lines: ["Accurate answers", "with citations"],
  },
  {
    icon: MessageCircle,
    lines: ["Multiple conversations", "per document"],
  },
  {
    icon: ShieldCheck,
    lines: ["Secure & private"],
  },
];

export function DashboardHero({ onOpenUpload }: DashboardHeroProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // react-spring controlling the expanding (1.15) and contracting (1.0) behavior with a gentle, refined jiggle
  const { blobScale } = useSpring({
    blobScale: isHovered || isDragging ? 1.15 : 1.0,
    config: {
      tension: 50,
      friction: 10,
      precision: 0.001,
    },
  });

  return (
    <div className="relative isolate grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 pb-8 sm:pb-10">
      {/* Atmospheric bottom glow covering ~1/3 of the hero container */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-1/2 z-0 select-none overflow-hidden"
      >
        <div className="w-full h-full hero-bottom-glow opacity-30 mx-auto transform-gpu" />
      </div>

      {/* Sharp razor edge glow at the bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] sharp-edge-glow z-10 opacity-10 select-none"
      />

      {/* Left Column: Bold Headline & Micro-badges matching reference image with balanced hierarchy */}
      <div className="lg:col-span-7 relative z-10 flex flex-col justify-center">
        {/* Soft atmospheric ambient aura to balance right column luminance */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 -right-1/2 w-72 h-72 rounded-full bg-purple-200/10 blur-[80px] -z-10 transform-gpu"
        />

        {/* Title Group: Eyebrow + Heading tightly clustered */}
        <div className="space-y-3">
          <div className="inline-block">
            <span className="text-xs sm:text-[13px] font-bold tracking-[0.22em] text-[#818cf8] uppercase select-none">
              YOUR KNOWLEDGE. AMPLIFIED.
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[52px] font-extrabold tracking-tight text-white leading-[1.08]">
            Chat with <br />
            your{" "}
            <span className="bg-[linear-gradient(90deg,#f472b6_0%,#c084fc_32%,#818cf8_65%,#38bdf8_100%)] bg-clip-text text-transparent">
              documents.
            </span>
          </h1>
        </div>

        {/* Subtitle with balanced line-length */}
        <p className="mt-4 sm:mt-5 text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
          Upload a PDF, ask questions, get instant answers
          <br className="hidden sm:inline" /> with citations. Turn your documents into insights.
        </p>

        {/* Feature Highlights: Proportional, balanced micro-features */}
        <div className="mt-7 sm:mt-8 flex flex-wrap sm:flex-nowrap items-center gap-5 sm:gap-6 lg:gap-7">
          {HERO_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="flex items-center gap-3 shrink-0">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0c1017]/70 backdrop-blur-xs text-slate-200 shadow-xs shadow-black/40 transition-all duration-200 hover:border-white/[0.14] hover:bg-[#111622]/90 hover:text-white">
                  <Icon className="h-[18px] w-[18px] text-slate-300" strokeWidth={1.75} />
                </div>
                <div className="text-xs sm:text-[12.5px] text-slate-400 leading-[1.3] select-none">
                  {feat.lines.map((line, lIdx) => (
                    <div key={lIdx} className="whitespace-nowrap">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Gradient Orb Dropzone Area replacing the rectangle */}
      <div className="lg:col-span-5 relative flex justify-center lg:justify-end z-10">
        {/* Playful Handwritten Annotation & Curved Arrow matching Image 1 */}
        <div className="absolute top-10 right-0 hidden sm:flex items-start gap-1 select-none pointer-events-none z-20">
          <div className="text-right font-handwriting text-[#a5b4fc] text-base sm:text-lg leading-tight pr-1">
            Upload
            <br />
            Ask
            <br />
            Discover
          </div>
          <svg
            width="36"
            height="50"
            viewBox="0 0 36 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#818cf8]"
          >
            <path
              d="M28 2C24 16 12 24 6 38M6 38L2 31M6 38L13 36"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Dropzone Container with 3D Gradient Orb */}
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenUpload}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenUpload();
            }
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            onOpenUpload();
          }}
          className="group relative w-full aspect-square sm:h-[420px] flex items-center justify-center cursor-pointer"
        >
          {/* 3D GLSL Gradient Orb with react-spring expansion — no CSS scaling */}
          <div className="absolute -inset-8 sm:-inset-16 pointer-events-none">
            <GradientOrb
              config={{
                background: "transparent",
                hue: 0,
                rotationSpeed: 0.35,
                noiseScale: 0.8,
                innerRadius: 0.5,
                wobbleStrength: 0.1,
                wobbleSpeed: 0.8,
                scaleFactor: 0.8,
              }}
              scale={blobScale}
              className="w-full h-full"
            />
          </div>

          {/* Elements inside matching the reference image */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 select-none pointer-events-none">
            {/* Glowing Upload Icon */}
            <div className="mx-auto flex items-center justify-center">
              <Upload
                className="w-10 h-10 sm:w-12 sm:h-12 text-[#b7a6fd] drop-shadow-[0_0_20px_rgba(167,139,250,0.55)] group-hover:text-[#ddd6fe] group-hover:drop-shadow-[0_0_28px_rgba(167,139,250,0.8)] transition-all duration-300"
                strokeWidth={2.4}
              />
            </div>

            {/* Card Copy */}
            <h3 className="mt-4 sm:mt-5 text-md font-medium text-indigo-300 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              Drop your PDF here
            </h3>

            {/* Subtext */}
            <p className="mt-1.5 sm:mt-2 text-sm text-[#94a3b8] font-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              or click to upload
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
