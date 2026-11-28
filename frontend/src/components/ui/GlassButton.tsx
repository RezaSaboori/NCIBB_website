import { Button, type ButtonProps } from "@heroui/react"
import { forwardRef } from "react"
import { glassButtonSurfaces, type GlassButtonTone } from "./glassButtonSurfaces"
import "./GlassButton.css"

export type GlassButtonProps = Pick<ButtonProps,
  "children" | "className" | "form" | "isDisabled" | "isIconOnly" | "isLoading" |
  "onClick" | "onPress" | "size" | "startContent" | "type" | "variant" | "aria-label" |
  "aria-disabled" | "aria-busy" | "aria-pressed" | "aria-haspopup"
> & { color?: ButtonProps["color"] | "pending" | "success"; inset?: boolean }

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton({ children, color, className = "", inset, isIconOnly, size, ...props }, ref) {
    const surface = glassButtonSurfaces[color as GlassButtonTone] ?? "glass"
    const iconOnly = isIconOnly ? " ui-glass-button--icon" : ""
    return <Button {...props} ref={ref} disableAnimation disableRipple isIconOnly={isIconOnly} size={size} radius="full"
      data-control-size={size === "sm" ? "compact" : undefined}
      className={`ui-glass-button${iconOnly} ${inset ? "ui-glass-button--inset" : surface} ${className}`}>
      {inset ? <span className={`ui-glass-button__inset ${surface}`}>{children}</span> : children}
    </Button>
  },
)
