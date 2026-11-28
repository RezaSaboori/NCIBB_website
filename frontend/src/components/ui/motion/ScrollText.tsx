import type { ReactNode } from "react"
import { useScrollText } from "./useScrollText"

export function ScrollText({ text, suffix, className, focusable = false, stopTouchPropagation = false }: {
  text: string
  suffix?: ReactNode
  className?: string
  focusable?: boolean
  stopTouchPropagation?: boolean
}) {
  const { wrapperRef, innerRef } = useScrollText(text, focusable, stopTouchPropagation)
  const label = <>{text}{suffix && <>{" "}{suffix}</>}</>

  return (
    <span className={`ui-scroll-text${className ? ` ${className}` : ""}`} ref={wrapperRef} dir="auto">
      <span className="ui-scroll-text__label">{label}</span>
      <span className="ui-scroll-text__reveal" ref={innerRef} aria-hidden="true">{label}</span>
    </span>
  )
}
