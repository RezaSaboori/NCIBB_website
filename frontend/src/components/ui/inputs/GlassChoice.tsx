import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react"
import "./GlassChoice.css"

type ChoiceProps = Omit<ComponentPropsWithoutRef<"input">, "children" | "className" | "type" | "name"> & {
  label: ReactNode
  className?: string
}

type GlassChoiceProps = ChoiceProps & (
  | { type?: "checkbox"; name?: string }
  | { type: "radio"; name: string }
)

export const GlassChoice = forwardRef<HTMLInputElement, GlassChoiceProps>(
  function GlassChoice({ label, type = "checkbox", className = "", dir, ...props }, ref) {
    return (
      <label className={`ui-glass-choice ${className}`} dir={dir}>
        <input {...props} ref={ref} type={type} className="ui-glass-choice__input" />
        <span className="ui-glass-choice__surface glass" aria-hidden="true" />
        <span className="ui-glass-choice__surface blue-glass" aria-hidden="true" />
        <span className="ui-glass-choice__mark" aria-hidden="true" />
        <span className="ui-glass-choice__label">{label}</span>
      </label>
    )
  },
)
