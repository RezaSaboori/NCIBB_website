import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import { applyThemeVariables } from "../../utils/theme/themePreloader"
import { useReducedMotionPreference } from "../ui/motion/useReducedMotionPreference"

interface ThemeContextType {
  theme: "light" | "dark"
  toggleTheme: () => void
  setTheme: (theme: "light" | "dark") => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeContextProviderProps {
  children: ReactNode
}

export const ThemeContextProvider = ({
  children,
}: ThemeContextProviderProps) => {
  const reducedMotion = useReducedMotionPreference()
  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem("theme") as "light" | "dark"
    return savedTheme || "light"
  })

  const setTheme = (newTheme: "light" | "dark") => {
    // Check if the View Transition API is supported
    if (!reducedMotion && typeof document.startViewTransition === "function") {
      document.startViewTransition(() => {
        setThemeState(newTheme)
        localStorage.setItem("theme", newTheme)
      })
    } else {
      setThemeState(newTheme)
      localStorage.setItem("theme", newTheme)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-theme", theme)

    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // Apply preloaded CSS variables for instant update
    applyThemeVariables(theme)

    if (reducedMotion) return
    // Add a temporary class to enable smooth transitions
    root.classList.add("theme-transition")
    const timeout = setTimeout(() => {
      root.classList.remove("theme-transition")
    }, 1000)

    return () => {
      clearTimeout(timeout)
      root.classList.remove("theme-transition")
    }
  }, [reducedMotion, theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeContextProvider")
  }
  return context
}
