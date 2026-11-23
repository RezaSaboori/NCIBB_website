import { Button, type ButtonProps } from "@heroui/react"
import "./GlassButton.css"

type GlassButtonProps = Pick<ButtonProps,
  "children" | "className" | "color" | "form" | "isDisabled" | "isIconOnly" | "isLoading" |
  "onPress" | "size" | "startContent" | "type" | "variant" | "aria-label"
>

export function GlassButton({ color, className = "", isIconOnly, ...props }: GlassButtonProps) {
  const surface = color === "primary" ? "blue-glass" : color === "danger" ? "red-glass" : "glass"
  const iconOnly = isIconOnly ? " ui-glass-button--icon" : ""
  return <Button {...props} isIconOnly={isIconOnly} radius="full" className={`ui-glass-button${iconOnly} ${surface} ${className}`} />
}
