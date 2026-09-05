import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserProfile } from "@/services/user.service";

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile with quota info.
 * User provisioning is handled exclusively via the Clerk webhook.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getUserProfile(userId);
  if (!profile) {
    return NextResponse.json(
      { error: "User profile not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(profile);
}
