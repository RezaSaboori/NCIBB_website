import { forwardRef, type ComponentPropsWithoutRef } from "react"
import "../inputs.css"

export const SingleLineInput = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  function SingleLineInput({ className = "", ...props }, ref) {
    return (
      <span className="ui-input-shell ui-input-shell--persian">
        <input {...props} ref={ref} className={`ui-input-field ${className}`} />
      </span>
    )
  },
)
