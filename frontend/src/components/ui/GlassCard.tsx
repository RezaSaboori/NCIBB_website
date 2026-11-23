import type { ReactNode } from "react"
import "./GlassCard.css"

interface GlassCardProps {
  children: ReactNode
  heading?: ReactNode
  footer?: ReactNode
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}

export function GlassCard({ children, heading, footer, size = "md", className = "" }: GlassCardProps) {
  return (
    <section className={`glass dz-glass-container dz-glass-container--${size} ui-glass-card ${className}`}>
      <header className="dz-glass-container__header">{heading}</header>
      <div className="dz-glass-container__body">{children}</div>
      <footer className="dz-glass-container__footer">{footer}</footer>
    </section>
  )
}
