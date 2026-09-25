"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SYSTEM_PROMPT_PRESETS,
  STORAGE_KEY_CUSTOM_PROMPT,
  STORAGE_KEY_ACTIVE_PRESET,
  PromptPreset,
} from "../constants/prompt-presets";
import { settingsService } from "../services/settings.service";

export const SETTINGS_QUERY_KEYS = {
  userProfile: ["user-profile"] as const,
};

export function useCustomPrompt() {
  const queryClient = useQueryClient();
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(STORAGE_KEY_ACTIVE_PRESET) || "balanced";
    }
    return "balanced";
  });

  const [promptText, setPromptText] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        window.localStorage.getItem(STORAGE_KEY_CUSTOM_PROMPT) ||
        SYSTEM_PROMPT_PRESETS[0].prompt
      );
    }
    return SYSTEM_PROMPT_PRESETS[0].prompt;
  });

  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  // Hydrate from Postgres
  const { data: profile } = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.userProfile,
    queryFn: settingsService.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!profile) return;
    if (profile.customPreset) {
      setSelectedPreset(profile.customPreset);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY_ACTIVE_PRESET, profile.customPreset);
      }
    }
    if (profile.customPrompt) {
      setPromptText(profile.customPrompt);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY_CUSTOM_PROMPT, profile.customPrompt);
      }
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: settingsService.updateCustomPrompt,
    onMutate: async ({ customPrompt, customPreset }) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY_CUSTOM_PROMPT, customPrompt);
        window.localStorage.setItem(STORAGE_KEY_ACTIVE_PRESET, customPreset);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.userProfile });
      setSavedNotice(true);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = setTimeout(() => {
        setSavedNotice(false);
      }, 2500);
    },
    onError: (err) => {
      console.error("Failed to update custom prompt:", err);
    },
  });

  const selectPreset = useCallback((preset: PromptPreset) => {
    setSelectedPreset(preset.id);
    setPromptText(preset.prompt);
  }, []);

  const selectCustom = useCallback(() => {
    setSelectedPreset("custom");
  }, []);

  const updatePromptText = useCallback((newText: string) => {
    setPromptText(newText);
    const matchingPreset = SYSTEM_PROMPT_PRESETS.find((p) => p.prompt === newText);
    setSelectedPreset(matchingPreset ? matchingPreset.id : "custom");
  }, []);

  const savePrompt = useCallback(() => {
    mutation.mutate({
      customPrompt: promptText,
      customPreset: selectedPreset,
    });
  }, [mutation, promptText, selectedPreset]);

  const activeLabel = useMemo(() => {
    if (selectedPreset === "custom") return "Custom prompt active";
    return `${selectedPreset} preset applied`;
  }, [selectedPreset]);

  return {
    selectedPreset,
    promptText,
    savedNotice,
    isSaving: mutation.isPending,
    activeLabel,
    selectPreset,
    selectCustom,
    updatePromptText,
    savePrompt,
  };
}
