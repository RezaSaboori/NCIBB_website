import { Around } from "@theme-toggles/react"
import { ThemeToggleProps } from "../types"

export const ThemeToggle = ({
  className,
}: ThemeToggleProps) => {
  const handleToggle = () => {
    const html = document.documentElement
    const isDark = html.classList.contains("dark")
    if (isDark) {
      html.classList.remove("dark")
    } else {
      html.classList.add("dark")
    }
  }

  return (
    <fieldset
      className="header-nav header-nav--icon"
      style={{ paddingBottom: "0.4rem", paddingRight: "0.4rem" }}
    >
      <legend className="header-nav__legend">Toggle Dark Mode</legend>
      <Around
        className={`header-nav__control ${className || ""}`}
        id="dark-mode-toggle"
        aria-label="Toggle Dark Mode"
        title="Toggle Dark Mode"
        onClick={handleToggle}
      />
    </fieldset>
  )
}
