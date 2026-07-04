import { Home, MessageCircle, FileText, User, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/my-posts", label: "My Posts", icon: FileText },
  { href: "/chats", label: "Chats", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export const SIDEBAR_EXTRA = [{ href: "/settings", label: "Settings", icon: Settings }] as const;
