import { Around } from "@theme-toggles/react"
import "@theme-toggles/react/css/Around.css"

import { HeaderProps, NavigationItem } from "./types"
import { useActiveIndicator } from "./hooks/useActiveIndicator"
import { useTheme } from "../theme"
import { HomeButton } from "./components/HomeButton"
import { ProfileButton } from "./components/ProfileButton"
import { ThemeToggle } from "./components/ThemeToggle"
import { Navigation } from "./components/Navigation"
import "./styles/header.css"

const navigationItems: NavigationItem[] = [
  { value: "home", label: "خانه", checked: true },
  { value: "portal", label: "درگاه" },
  { value: "dataset", label: "خدمات" },
  { value: "resources", label: "منابع" },
  { value: "about", label: "درباره ما" },
  { value: "contact", label: "تماس با ما" },
]

export const Header = ({ className }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme()

  useActiveIndicator()

  return (
    <div className={`header-container ${className || ""}`}>
      <HomeButton ariaLabel="خانه" title="خانه" />

      <Navigation items={navigationItems} />

      <ProfileButton ariaLabel="پروفایل" title="پروفایل کاربر" />

      <ThemeToggle
        isToggled={theme === "dark"}
        onToggle={() => toggleTheme()}
      />
    </div>
  )
}
