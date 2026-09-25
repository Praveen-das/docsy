import { redirect } from "next/navigation";

/**
 * /settings now renders as a global modal.
 * Any direct visit or bookmark to /settings redirects to home with the settings modal open.
 */
export default function SettingsPage() {
  redirect("/?settings=profile");
}
