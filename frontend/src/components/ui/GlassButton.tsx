import { Button, type ButtonProps } from "@heroui/react"
import "./GlassButton.css"

type GlassButtonProps = Pick<ButtonProps,
  "children" | "className" | "color" | "form" | "isDisabled" | "isLoading" |
  "onPress" | "size" | "startContent" | "type" | "variant" | "aria-label"
>

export function GlassButton({ color, className = "", ...props }: GlassButtonProps) {
  const surface = color === "primary" ? "blue-glass" : color === "danger" ? "red-glass" : "glass"
  return <Button {...props} radius="full" className={`ui-glass-button ${surface} ${className}`} />
}
