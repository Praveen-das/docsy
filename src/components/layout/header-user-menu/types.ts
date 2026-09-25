import {
  LucideIcon,
  User,
  FileText,
  Settings,
  BarChart3,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface UserMenuProfileInfo {
  displayName: string;
  userEmail: string;
  userInitials: string;
  imageUrl?: string | null;
  planName?: string;
}

export const MAIN_MENU_ITEMS: MenuItem[] = [
  {
    label: "My Profile",
    href: "?settings=profile",
    icon: User,
  },
  {
    label: "Customize",
    href: "?settings=customize",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "?settings=general",
    icon: Settings,
  },
  {
    label: "Usage & Billing",
    href: "?settings=billing",
    icon: BarChart3,
  },
];

export const SECONDARY_MENU_ITEMS: MenuItem[] = [
  {
    label: "Help & Support",
    href: "/support",
    icon: HelpCircle,
  },
  {
    label: "Send Feedback",
    href: "/feedback",
    icon: MessageSquare,
  },
];
