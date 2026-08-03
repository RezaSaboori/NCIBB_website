export interface NavItem {
  id: string
  label: string
  icon: string
}

export const primaryNavItems: NavItem[] = [
  { id: "dashboard", label: "کارتابل", icon: "streamline-sharp:dashboard-circle-solid" },
  { id: "account", label: "پروفایل", icon: "solar:user-bold" },
  { id: "messages", label: "پیام ها", icon: "tabler:message-circle-filled" },
  { id: "projects", label: "پروژه ها", icon: "material-symbols:folder-open-rounded" },
]

export const bottomNavItems: NavItem[] = [
  { id: "learning", label: "آموزش", icon: "ic:round-school" },
]