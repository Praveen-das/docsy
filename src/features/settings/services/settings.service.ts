import { api } from "@/lib/api-client";

export interface UserProfileResponse {
  customPrompt?: string | null;
  customPreset?: string;
  dailyQueriesUsed?: number;
  dailyQueriesLimit?: number;
}

export interface UpdateCustomPromptPayload {
  customPrompt: string;
  customPreset: string;
}

export const settingsService = {
  async getProfile(): Promise<UserProfileResponse> {
    const res = await api.get<UserProfileResponse>("/api/auth/me");
    return res.data;
  },

  async updateCustomPrompt(payload: UpdateCustomPromptPayload): Promise<UserProfileResponse> {
    const res = await api.patch<UserProfileResponse>("/api/auth/me", payload);
    return res.data;
  },
};
