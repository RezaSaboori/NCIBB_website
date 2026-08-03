import { HeaderProps, NavigationItem } from "./types"
import { useActiveIndicator } from "./hooks/useActiveIndicator"
import { HomeButton } from "./components/HomeButton"
import { ProfileButton } from "./components/ProfileButton"
import { ThemeToggle } from "./components/ThemeToggle"
import { Navigation } from "./components/Navigation"
import { useTheme } from "../theme"
import "./styles/header.css"

const navigationItems: NavigationItem[] = [
  { value: "home", label: "خانه", checked: true },
  { value: "portal", label: "درگاه" },
  { value: "dataset", label: "خدمات" },
  { value: "resources", label: "منابع" },
  { value: "about", label: "درباره ما" },
  { value: "contact", label: "تماس با ما" },
]

export const Header = ({ className, sidebarOffset }: HeaderProps) => {
  const { theme } = useTheme()
  useActiveIndicator()

  return (
    <div
      className={`header-container ${className || ""} ${theme === "dark" ? "theme-dark" : "theme-light"}`}
      style={sidebarOffset ? { transform: `translateX(calc(-50% - ${sidebarOffset} / 2))` } : undefined}
    >
      <HomeButton ariaLabel="خانه" title="خانه" />

      <Navigation items={navigationItems} />

      <ProfileButton ariaLabel="پروفایل" title="پروفایل کاربر" />

      <ThemeToggle />
    </div>
  )
}
