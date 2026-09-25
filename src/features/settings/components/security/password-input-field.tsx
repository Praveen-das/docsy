"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  allowToggleVisibility?: boolean;
  className?: string;
}

/**
 * Reusable password input field with optional visibility toggle (Eye/EyeOff),
 * accessible labels, and obsidian glassmorphic styling.
 */
export function PasswordInputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  autoComplete,
  allowToggleVisibility = true,
  className,
}: PasswordInputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-xs font-medium text-zinc-300 block select-none">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={allowToggleVisibility && showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            "w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-zinc-200 outline-none",
            "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all",
            "placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-inner backdrop-blur-sm",
            allowToggleVisibility && "pr-10",
          )}
        />
        {allowToggleVisibility && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            {showPassword ? (
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
