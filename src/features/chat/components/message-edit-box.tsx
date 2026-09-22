"use client";

import { Button } from "@/components/ui/button";
import React, { useRef, useEffect } from "react";

interface MessageEditBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function MessageEditBox({ value, onChange, onSave, onCancel }: MessageEditBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="w-full rounded-2xl edit-box-glow p-3 shadow-sm space-y-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[13.5px] leading-relaxed text-zinc-200 bg-transparent resize-none focus:outline-none placeholder:text-zinc-600"
        rows={3}
      />
      <div className="flex justify-end gap-1.5">
        {/* Cancel — ghost variant */}
        <button
          type="button"
          onClick={onCancel}
          className="h-8 px-3 py-1.5 text-xs rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors duration-[120ms] active:scale-[0.98] cursor-pointer"
        >
          Cancel
        </button>
        {/* Save — accent variant */}
        <Button onClick={onSave} variant="gradient" size="sm">
          Save
        </Button>
      </div>
    </div>
  );
}
