import { Around } from "@theme-toggles/react"
import { ThemeToggleProps } from "../types"
import { useTheme } from "../../theme"

export const ThemeToggle = ({
  className,
}: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <fieldset
      className="header-nav header-nav--icon glass-transparent"
      style={{ paddingBottom: "0.4rem", paddingRight: "0.4rem" }}
    >
      <legend className="header-nav__legend">Toggle Dark Mode</legend>
      <Around
        className={`header-nav__control ${className || ""}`}
        id="dark-mode-toggle"
        aria-label="Toggle Dark Mode"
        title="Toggle Dark Mode"
        toggled={theme === "dark"}
        toggle={toggleTheme}
      />
    </fieldset>
  )
}
