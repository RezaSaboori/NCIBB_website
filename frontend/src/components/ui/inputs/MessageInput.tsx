import { forwardRef, type ComponentPropsWithoutRef } from "react"
import "../inputs.css"

export const MessageInput = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<"textarea">>(
  function MessageInput({ className = "", ...props }, ref) {
    return (
      <span className="ui-input-shell ui-input-shell--persian ui-input-shell--grow">
        <textarea {...props} ref={ref} className={`ui-input-field ui-input-field--textarea ${className}`} />
      </span>
    )
  },
)
