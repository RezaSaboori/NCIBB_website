import { useRef } from "react"
import { useDisclosure } from "@heroui/react"
import { AuthModal } from "../auth/modal/AuthModal"
import type { HeaderProps, NavigationItem } from "./types"
import { useHeaderHeight } from "./hooks/useHeaderHeight"
import { HomeButton } from "./components/HomeButton"
import { ProfileButton } from "./components/ProfileButton"
import { ThemeToggle } from "./components/ThemeToggle"
import { Navigation } from "./components/Navigation"
import { useTheme } from "../theme"
import "./styles/header.css"

const navigationItems: NavigationItem[] = [
  { value: "home", label: "خانه" },
  { value: "portal", label: "درگاه" },
  { value: "dataset", label: "خدمات" },
  { value: "resources", label: "منابع" },
  { value: "about", label: "درباره ما" },
  { value: "contact", label: "تماس با ما" },
]

export const Header = ({ className }: HeaderProps) => {
  const { theme } = useTheme()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const header = useRef<HTMLElement>(null)
  useHeaderHeight(header)

  return (
    <header
      ref={header}
      className={`header-container ${className || ""} ${theme === "dark" ? "theme-dark" : "theme-light"}`}
    >
      <HomeButton ariaLabel="خانه" title="خانه" />

      <Navigation items={navigationItems} onProfileSignIn={onOpen} />

      <ProfileButton ariaLabel="پروفایل" title="پروفایل کاربر" onSignIn={onOpen} />

      <ThemeToggle />
      <AuthModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </header>
  )
}
