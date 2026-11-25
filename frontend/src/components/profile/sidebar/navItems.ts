import type { IconifyIcon } from "@iconify/react"
import { coinIcon } from "@/components/ui/coinIcon"
import type { AccountProfile } from "@/types/account"
import { profileNavIcons } from "./profileNavIcons"

export interface NavItem {
  id: string
  label: string
  icon: IconifyIcon
}

export function profileNavigation(profile: AccountProfile) {
  const has = (capability: string) => profile.capabilities.includes(capability)
  const primary: NavItem[] = [
    { id: "dashboard", label: "داشبورد", icon: profileNavIcons.dashboard },
    { id: "account", label: "پروفایل", icon: profileNavIcons.account },
    { id: "wallet", label: "کیف پول", icon: coinIcon },
    { id: "messages", label: "پیام‌ها", icon: profileNavIcons.messages },
  ]
  if (has("profile.projects")) primary.push({ id: "projects", label: "پروژه‌ها", icon: profileNavIcons.projects })
  if (has("messaging.support_queue")) primary.push({ id: "support", label: "صف پشتیبانی", icon: profileNavIcons.support })
  if (has("platform.admin")) {
    primary.push({ id: "users", label: "کاربران", icon: profileNavIcons.users })
    primary.push({ id: "roles", label: "نقش‌ها و مجوزها", icon: profileNavIcons.roles })
  }
  if (has("platform.admin") || profile.groups.some((group) => group.can_manage_wallet)) {
    primary.push({ id: "groups", label: "مدیریت گروه‌ها", icon: profileNavIcons.groups })
  }
  if (has("profile.research_groups")) {
    primary.push({ id: "research", label: "گروه‌های پژوهشی", icon: profileNavIcons.research })
  }
  const bottom: NavItem[] = has("profile.learning") ? [{ id: "learning", label: "آموزش", icon: profileNavIcons.learning }] : []
  return { primary, bottom }
}
