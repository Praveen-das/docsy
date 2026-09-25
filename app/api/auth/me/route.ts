import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserProfile, updateUserCustomPrompt } from "@/services/user.service";
import { z } from "zod";

const updateCustomPromptSchema = z.object({
  customPrompt: z.string().max(3000).nullable().optional(),
  customPreset: z.string().max(50).optional(),
});

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile with quota info and custom AI prompt.
 * User provisioning is handled exclusively via the Clerk webhook.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getUserProfile(userId);
  if (!profile) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

/**
 * PATCH /api/auth/me
 * Persists user's custom system prompt and selected preset to Postgres.
 */
export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateCustomPromptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { customPrompt, customPreset } = parsed.data;
    const result = await updateUserCustomPrompt(
      userId,
      customPrompt ?? null,
      customPreset ?? "balanced"
    );

    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
