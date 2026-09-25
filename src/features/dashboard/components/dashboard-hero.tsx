"use client";

import { FileText, MessageCircle, ShieldCheck } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { AtmosphericUploadZone } from "./atmospheric-upload-zone";
import { MobileHeroUploadCard } from "./mobile-hero-upload-card";

const HERO_FEATURES = [
  {
    icon: FileText,
    title: "Accurate answers",
    subtitle: "with citations",
  },
  {
    icon: MessageCircle,
    title: "Multiple conversations",
    subtitle: "per document",
  },
  {
    icon: ShieldCheck,
    title: "Secure & private",
    subtitle: "Your files stay yours",
  },
];

export function DashboardHero() {
  return (
    <div className="relative isolate pt-2 sm:pt-8 pb-4 sm:pb-8 lg:pb-16">
      {/* DESKTOP LAYOUT (≥ lg): 12-column side-by-side with 3D Atmospheric Orb */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-center">
        {/* Atmospheric bottom glow covering hero container (Desktop only) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-1/2 z-0 select-none overflow-hidden"
        >
          <div className="w-full h-full hero-bottom-glow opacity-30 mx-auto" />
        </div>

        {/* Sharp razor edge glow at the bottom (Desktop only) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] sharp-edge-glow z-10 opacity-10 select-none"
        />
        {/* Left Column: Bold Headline & Micro-badges */}
        <div className="lg:col-span-5 xl:col-span-5 relative z-10 flex flex-col justify-center text-left items-start">
          {/* Soft atmospheric ambient aura */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-3/4 w-72 h-72 rounded-full bg-purple-400/10 blur-[90px] -z-10"
          />

          {/* Title Group */}
          <div className="space-y-3">
            <Eyebrow>YOUR KNOWLEDGE. AMPLIFIED.</Eyebrow>

            <h1 className="text-[46px] xl:text-[50px] font-extrabold tracking-tight text-white leading-[1.08]">
              Chat with <br />
              your{" "}
              <span className="bg-[linear-gradient(90deg,#e879f9_0%,#c084fc_35%,#818cf8_70%,#60a5fa_100%)] bg-clip-text text-transparent">
                documents.
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-4 text-[15px] text-slate-400 max-w-md leading-relaxed">
            Upload a PDF, ask questions, get instant answers with citations. Turn your documents into insights.
          </p>

          {/* Feature Highlights: Vertically stacked badges matching desktop reference */}
          <div className="mt-9 flex flex-col gap-4 w-full max-w-sm">
            {HERO_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="flex items-center gap-3.5 text-left">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-(--tile-border) bg-(--tile-bg) text-slate-300 shadow-sm shadow-black/40">
                    <Icon className="h-5 w-5 text-slate-300" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-200 leading-tight">{feat.title}</div>
                    <div className="text-[12px] text-slate-400 mt-0.5 leading-tight">{feat.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Functional Core + Atmospheric Glow Upload Area */}
        <div className="lg:col-span-7 xl:col-span-7 relative flex items-center justify-end z-10 w-full">
          <AtmosphericUploadZone />
        </div>
      </div>

      {/* MOBILE & TABLET LAYOUT (< lg): Spacious, de-congested design strictly matching mockup */}
      <div className="lg:hidden flex flex-col text-left items-start w-full relative z-10">
        {/* Title Group */}
        <div className="space-y-2">
          <Eyebrow>YOUR KNOWLEDGE. AMPLIFIED.</Eyebrow>

          <h1 className="text-[32px] xs:text-[36px] sm:text-[40px] font-extrabold tracking-tight text-white leading-[1.12]">
            Chat with <br />
            your{" "}
            <span className="bg-[linear-gradient(90deg,#e879f9_0%,#c084fc_35%,#818cf8_70%,#60a5fa_100%)] bg-clip-text text-transparent">
              documents.
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="mt-3 sm:mt-4 text-[13px] xs:text-sm text-slate-400 max-w-lg leading-relaxed">
          Upload a PDF, ask questions, get instant answers with citations. Turn your documents into insights.
        </p>

        {/* Mobile Upload Card */}
        <div className="w-full mt-5 xs:mt-6">
          <MobileHeroUploadCard />
        </div>
      </div>
    </div>
  );
}
