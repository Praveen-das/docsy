export interface PromptPreset {
  id: string;
  label: string;
  prompt: string;
}

export const SYSTEM_PROMPT_PRESETS: PromptPreset[] = [
  {
    id: "balanced",
    label: "Balanced",
    prompt:
      "Provide clear, well-structured answers grounded directly in the provided documents. Highlight key takeaways, synthesize relevant sections, and maintain an objective, informative tone with clear source attribution.",
  },
  {
    id: "concise",
    label: "Concise",
    prompt:
      "Deliver direct, straight-to-the-point answers without fluff. Prioritize bullet points, bold key conclusions, and state facts directly derived from the document context in as few words as possible.",
  },
  {
    id: "analytical",
    label: "Analytical",
    prompt:
      "Analyze the material rigorously. Break down complex arguments, evaluate underlying assumptions, compare perspectives across sections, and emphasize evidence, data points, and logical connections.",
  },
  {
    id: "executive",
    label: "Executive",
    prompt:
      "Format responses as high-level executive summaries. Lead with the bottom line or core decision, followed by strategic implications, risk factors, and actionable next steps derived from the documents.",
  },
  {
    id: "explanatory",
    label: "Explanatory",
    prompt:
      "Explain concepts step-by-step with intuitive clarity. Unpack jargon, offer simple analogies where appropriate, and ensure complex technical or legal topics are accessible while remaining strictly faithful to the source text.",
  },
];

export const STORAGE_KEY_CUSTOM_PROMPT = "docsy_custom_system_prompt";
export const STORAGE_KEY_ACTIVE_PRESET = "docsy_custom_preset_id";
