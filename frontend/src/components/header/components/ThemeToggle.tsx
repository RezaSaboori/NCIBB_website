import { Around } from "@theme-toggles/react"
import { ThemeToggleProps } from "../types"
import { useTheme } from "../../theme"

export const ThemeToggle = ({
  className,
}: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <fieldset className="header-nav header-nav--icon header-nav--theme glass-navigation glass-transparent">
      <legend className="header-nav__legend">نمایش روشن و تیره</legend>
      <Around
        type="button"
        className={`header-nav__control ${className || ""}`}
        id="dark-mode-toggle"
        aria-label="حالت تیره"
        aria-pressed={theme === "dark"}
        title="حالت تیره"
        toggled={theme === "dark"}
        toggle={toggleTheme}
      />
    </fieldset>
  )
}
