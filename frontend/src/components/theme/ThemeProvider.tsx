import { ReactNode } from "react"
import { HeroUIProvider } from "@heroui/react"
import { ThemeContextProvider } from "./ThemeContext"

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <ThemeContextProvider>
      <HeroUIProvider locale="fa-IR">{children}</HeroUIProvider>
    </ThemeContextProvider>
  )
}
