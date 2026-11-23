import type { ComponentProps } from "react"
import "../inputs.css"

export function MessageInput({ className = "", ...props }: ComponentProps<"textarea">) {
  return (
    <span className="ui-input-shell ui-input-shell--persian ui-input-shell--grow">
      <textarea {...props} className={`ui-input-field ui-input-field--textarea ${className}`} />
    </span>
  )
}
