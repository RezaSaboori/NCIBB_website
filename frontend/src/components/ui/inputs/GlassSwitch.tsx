import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react"
import "./GlassSwitch.css"

type GlassSwitchProps = Omit<ComponentPropsWithoutRef<"input">, "children" | "className" | "role" | "type"> & {
  label: ReactNode
  className?: string
}

export const GlassSwitch = forwardRef<HTMLInputElement, GlassSwitchProps>(
  function GlassSwitch({ label, className = "", dir, ...props }, ref) {
    return (
      <label className={`ui-glass-switch ${className}`} dir={dir}>
        <input {...props} ref={ref} type="checkbox" role="switch" className="ui-glass-switch__input" />
        <span className="ui-glass-switch__track" aria-hidden="true">
          <span className="ui-glass-switch__surface glass" />
          <span className="ui-glass-switch__surface blue-glass" />
          <span className="ui-glass-switch__thumb">
            <span className="ui-glass-switch__surface blue-glass" />
            <span className="ui-glass-switch__surface glass" />
          </span>
        </span>
        <span>{label}</span>
      </label>
    )
  },
)
