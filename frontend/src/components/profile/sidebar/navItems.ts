import type { IconifyIcon } from "@iconify/react"
import { coinIcon } from "@/components/ui/coinIcon"
import type { AccountProfile } from "@/types/account"

export interface NavItem {
  id: string
  label: string
  icon: string | IconifyIcon
}

export function profileNavigation(profile: AccountProfile) {
  const has = (capability: string) => profile.capabilities.includes(capability)
  const primary: NavItem[] = [
    { id: "dashboard", label: "داشبورد", icon: "streamline-sharp:dashboard-circle-solid" },
    { id: "account", label: "پروفایل", icon: "solar:user-bold" },
    { id: "wallet", label: "کیف پول", icon: coinIcon },
    { id: "messages", label: "پیام‌ها", icon: "tabler:message-circle-filled" },
  ]
  if (has("profile.projects")) primary.push({ id: "projects", label: "پروژه‌ها", icon: "material-symbols:folder-open-rounded" })
  if (has("messaging.support_queue")) primary.push({ id: "support", label: "صف پشتیبانی", icon: "tabler:headset" })
  if (has("platform.admin")) {
    primary.push({ id: "users", label: "کاربران", icon: "solar:users-group-rounded-bold" })
    primary.push({ id: "roles", label: "نقش‌ها و مجوزها", icon: "solar:shield-check-bold" })
  }
  if (has("platform.admin") || profile.groups.some((group) => group.can_manage_wallet)) {
    primary.push({ id: "groups", label: "مدیریت گروه‌ها", icon: "tabler:hierarchy-2" })
  }
  if (has("profile.research_groups")) {
    primary.push({ id: "research", label: "گروه‌های پژوهشی", icon: "tabler:school" })
  }
  const bottom: NavItem[] = has("profile.learning") ? [{ id: "learning", label: "آموزش", icon: "ic:round-school" }] : []
  return { primary, bottom }
}
