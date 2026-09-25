import { redirect } from "next/navigation";

/**
 * /settings now renders as a global modal.
 * Any direct visit or bookmark to /settings redirects to the dashboard with the settings modal open.
 */
export default function SettingsPage() {
  redirect("/dashboard?settings=profile");
}
