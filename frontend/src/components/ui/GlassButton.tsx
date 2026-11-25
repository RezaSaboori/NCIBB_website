import { Button, type ButtonProps } from "@heroui/react"
import { glassButtonSurfaces, type GlassButtonTone } from "./glassButtonSurfaces"
import "./GlassButton.css"

export type GlassButtonProps = Pick<ButtonProps,
  "children" | "className" | "form" | "isDisabled" | "isIconOnly" | "isLoading" |
  "onClick" | "onPress" | "size" | "startContent" | "type" | "variant" | "aria-label" |
  "aria-disabled" | "aria-busy" | "aria-pressed"
> & { color?: ButtonProps["color"] | "pending" | "success" }

export function GlassButton({ color, className = "", isIconOnly, ...props }: GlassButtonProps) {
  const surface = glassButtonSurfaces[color as GlassButtonTone] ?? "glass"
  const iconOnly = isIconOnly ? " ui-glass-button--icon" : ""
  return <Button {...props} disableAnimation disableRipple isIconOnly={isIconOnly} radius="full"
    className={`ui-glass-button${iconOnly} ${surface} ${className}`} />
}
