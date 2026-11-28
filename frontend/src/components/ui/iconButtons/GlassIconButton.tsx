import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties } from "react"
import "./GlassIconButton.css"

export type IconButtonProps = Omit<ComponentPropsWithoutRef<"button">, "children" | "aria-label"> & {
  /** A pixel count or CSS length used for both sides of the button. */
  size: number | string
  inset?: boolean
  "aria-label": string
}

const actions = {
  // The menu and close paths share commands so the mobile toggle can interpolate between them.
  close: { surface: "red-glass", path: "M5 5L19 19M12 12L12 12M5 19L19 5" },
  delete: { surface: "red-glass", path: "M4 7h16m-1 0-.9 12.1A2 2 0 0 1 16.1 21H7.9a2 2 0 0 1-2-1.9L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3" },
  minimize: { surface: "orange-glass", path: "M5 12h14" },
  expand: { surface: "green-glass", path: "M7 13v4h4m-4 0 4-4m6-2V7h-4m4 0-4 4" },
  menu: { surface: "", path: "M5 8L19 8M5 12L19 12M5 16L19 16" },
  question: { surface: "teal-glass", path: "M8 7a4 4 0 1 1 5.5 3.7c-1.1.4-1.5 1-1.5 2.3v2m0 5h.01" },
} as const

type GlassIconButtonProps = IconButtonProps & { action: keyof typeof actions }

export const GlassIconButton = forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  function GlassIconButton({ action, size, inset, className = "", style, type = "button", ...props }, ref) {
    const { surface, path } = actions[action]
    const buttonStyle = {
      ...style,
      "--glass-icon-button-size": typeof size === "number" ? `${size}px` : size,
    } as CSSProperties

    const icon = (
      <svg
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d={path} />
      </svg>
    )

    return (
      <button
        {...props}
        ref={ref}
        className={`ui-glass-icon-button ${inset ? "ui-glass-icon-button--inset" : surface} ${className}`}
        style={buttonStyle}
        type={type}
      >
        {inset ? <span className={`ui-glass-icon-button__inset ${surface}`}>{icon}</span> : icon}
      </button>
    )
  },
)
