export interface HeaderProps {
  className?: string
}

export interface NavigationItem {
  value: string
  label: string
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
  onProfileSignIn?: () => void
  className?: string
}
