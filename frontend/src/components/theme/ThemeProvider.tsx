import { ReactNode } from "react"
import { HeroUIProvider } from "@heroui/react"
import { ThemeContextProvider } from "./ThemeContext"

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <ThemeContextProvider>
      <HeroUIProvider>{children}</HeroUIProvider>
    </ThemeContextProvider>
  )
}
