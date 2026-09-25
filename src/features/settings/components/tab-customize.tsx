"use client";

import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SYSTEM_PROMPT_PRESETS } from "../constants/prompt-presets";
import { PresetPill } from "./customize/preset-pill";
import { useCustomPrompt } from "../hooks/use-custom-prompt";

export function TabCustomize() {
  const {
    selectedPreset,
    promptText,
    savedNotice,
    isSaving,
    activeLabel,
    selectPreset,
    selectCustom,
    updatePromptText,
    savePrompt,
  } = useCustomPrompt();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePrompt();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          onClick={selectCustom}
        />

        {SYSTEM_PROMPT_PRESETS.map((preset) => (
          <PresetPill
            key={preset.id}
            label={preset.label}
            isSelected={selectedPreset === preset.id}
            onClick={() => selectPreset(preset)}
          />
        ))}
      </div>

      {/* Prompt Textarea Card */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 focus-within:border-indigo-500/30 focus-within:bg-white/[0.03] transition-all">
        <textarea
          rows={6}
          value={promptText}
          onChange={(e) => updatePromptText(e.target.value)}
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
        <Button
          type="submit"
          variant="accent"
          size="sm"
          disabled={isSaving}
          className="rounded-lg active:scale-[0.98] disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Prompt"}
        </Button>
      </div>
    </form>
  );
}
