export interface HeaderProps {
  className?: string
  sidebarOffset?: string
}

export interface NavigationItem {
  value: string
  label: string
  checked?: boolean
}

export interface IconButtonProps {
  className?: string
  ariaLabel: string
  title?: string
  onClick?: () => void
}

export interface ThemeToggleProps {
  className?: string
}

export interface NavigationProps {
  items: NavigationItem[]
  onItemChange?: (value: string) => void
  className?: string
}
