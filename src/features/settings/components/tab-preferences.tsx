"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sliders, CheckCircle2, ShieldCheck } from "lucide-react";

export function TabPreferences() {
  const [referenceDepth, setReferenceDepth] = useState(5);
  const [includeQuotes, setIncludeQuotes] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setSavedNotice(false);
    }, 2500);
  };

  return (
    <form onSubmit={handleSaveConfig} className="space-y-4">
      {/* Grouped AI Document Intelligence Settings */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
          <Sliders className="h-4 w-4 text-indigo-400 shrink-0" />
          <div>
            <h3 className="text-[13px] font-semibold text-zinc-100">Document Answering Intelligence</h3>
            <p className="text-[11.5px] text-zinc-500 mt-0.5">
              Configure how documents are searched and cited.
            </p>
          </div>
        </div>

        {/* Source Reference Depth Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="ref-depth-range" className="text-[12.5px] font-medium text-zinc-300">
              Source Reference Depth
            </label>
            <span className="font-mono text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              {referenceDepth} passages
            </span>
          </div>
          <input
            id="ref-depth-range"
            type="range"
            min={1}
            max={10}
            value={referenceDepth}
            onChange={(e) => setReferenceDepth(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer h-1.5 rounded-lg appearance-none"
          />
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Higher depth inspects more chunks for exhaustive, multi-section answers.
          </p>
        </div>

        {/* Excerpt Citation Toggle */}
        <div className="flex items-start gap-3 pt-1 border-t border-white/[0.06]">
          <input
            type="checkbox"
            id="includeQuotes"
            checked={includeQuotes}
            onChange={(e) => setIncludeQuotes(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-indigo-500 cursor-pointer"
          />
          <label htmlFor="includeQuotes" className="cursor-pointer select-none">
            <span className="text-[12.5px] font-medium text-zinc-200 block">Show exact source excerpts</span>
            <span className="text-[11px] text-zinc-500 block mt-0.5 leading-relaxed">
              Hovering a citation badge previews the exact sentence from your document.
            </span>
          </label>
        </div>
      </div>

      {/* Confidentiality Notice */}
      <div className="flex items-start gap-2 text-[11.5px] text-zinc-500 px-1">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <span className="font-semibold text-zinc-400">Private & Confidential: </span>
          Your documents and conversations are strictly isolated to your account and never used to train public models.
        </span>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1">
        {savedNotice ? (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Preferences saved
          </span>
        ) : (
          <span className="text-[11.5px] text-zinc-500">Applies to all newly generated responses.</span>
        )}
        <Button type="submit" variant="accent" size="sm" className="rounded-lg active:scale-[0.98]">
          Save
        </Button>
      </div>
    </form>
  );
}
