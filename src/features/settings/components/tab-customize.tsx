"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SYSTEM_PROMPT_PRESETS,
  STORAGE_KEY_CUSTOM_PROMPT,
  STORAGE_KEY_ACTIVE_PRESET,
  PromptPreset,
} from "../constants/prompt-presets";
import { PresetPill } from "./customize/preset-pill";

export function TabCustomize() {
  const [selectedPreset, setSelectedPreset] = useState<string>("balanced");
  const [promptText, setPromptText] = useState<string>(SYSTEM_PROMPT_PRESETS[0].prompt);
  const [savedNotice, setSavedNotice] = useState(false);

  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  // Load saved prompt from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedPrompt = window.localStorage.getItem(STORAGE_KEY_CUSTOM_PROMPT);
    const savedPreset = window.localStorage.getItem(STORAGE_KEY_ACTIVE_PRESET);

    if (savedPreset) {
      setSelectedPreset(savedPreset);
    }
    if (savedPrompt) {
      setPromptText(savedPrompt);
    }
  }, []);

  const handleSelectPreset = (preset: PromptPreset) => {
    setSelectedPreset(preset.id);
    setPromptText(preset.prompt);
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setPromptText(newText);

    const matchingPreset = SYSTEM_PROMPT_PRESETS.find((p) => p.prompt === newText);
    setSelectedPreset(matchingPreset ? matchingPreset.id : "custom");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_CUSTOM_PROMPT, promptText);
      window.localStorage.setItem(STORAGE_KEY_ACTIVE_PRESET, selectedPreset);
    }
    setSavedNotice(true);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setSavedNotice(false);
    }, 2500);
  };

  const activeLabel = useMemo(() => {
    if (selectedPreset === "custom") return "Custom prompt active";
    return `${selectedPreset} preset applied`;
  }, [selectedPreset]);

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Description header */}
      <div>
        <h4 className="text-[13.5px] font-medium text-zinc-200">AI Personality & Response Style</h4>
        <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">
          Choose a style suggestion below or customize the prompt to tailor how Docsy reasons and formats answers.
        </p>
      </div>

      {/* Pill Suggestions Bar */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <PresetPill
          label="Custom"
          isSelected={selectedPreset === "custom"}
          onClick={() => setSelectedPreset("custom")}
        />

        {SYSTEM_PROMPT_PRESETS.map((preset) => (
          <PresetPill
            key={preset.id}
            label={preset.label}
            isSelected={selectedPreset === preset.id}
            onClick={() => handleSelectPreset(preset)}
          />
        ))}
      </div>

      {/* Prompt Textarea Card */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 focus-within:border-indigo-500/30 focus-within:bg-white/[0.03] transition-all">
        <textarea
          rows={6}
          value={promptText}
          onChange={handleCustomTextChange}
          placeholder="Describe how you'd like Docsy AI to interpret documents and answer queries..."
          className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none resize-none leading-relaxed custom-scrollbar"
        />
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            {activeLabel}
          </span>
          <span className="font-mono">{promptText.length} characters</span>
        </div>
      </div>

      {/* Save Action Row */}
      <div className="flex items-center justify-between pt-1">
        {savedNotice ? (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            System prompt saved successfully
          </span>
        ) : (
          <span className="text-[11.5px] text-zinc-500">Applies to all newly generated document answers.</span>
        )}
        <Button type="submit" variant="accent" size="sm" className="rounded-lg active:scale-[0.98]">
          Save Prompt
        </Button>
      </div>
    </form>
  );
}
