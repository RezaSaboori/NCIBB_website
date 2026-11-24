import type { ReactNode } from "react"
import { GlassButton, type GlassButtonProps } from "./GlassButton"
import { glassButtonSurfaces, type GlassButtonTone } from "./glassButtonSurfaces"
import { MotionSwap } from "./motion/MotionSwap"
import { useMeasuredSize } from "./motion/useMeasuredSize"
import "./StatefulGlassButton.css"

type StatefulGlassButtonProps = Pick<GlassButtonProps, "className" | "form" | "onPress" | "size" | "type" | "variant"> & {
  color?: GlassButtonTone
  label: string
  accessibleLabel?: string
  state: string
  icon?: ReactNode
  busy?: boolean
  disabled?: boolean
}

export function StatefulGlassButton({
  label, accessibleLabel = label, state, icon, busy, disabled, onPress, color, className = "", ...props
}: StatefulGlassButtonProps) {
  const { wrapperRef, contentRef } = useMeasuredSize<HTMLSpanElement>("inline")
  const unavailable = busy || disabled
  const toneClass = color ? ` ui-state-button--${color}` : ""

  return (
    <GlassButton {...props} aria-label={accessibleLabel} aria-busy={busy || undefined}
      aria-disabled={unavailable || undefined} className={`ui-state-button${toneClass} ${className}`}
      onClick={(event) => { if (unavailable) event.preventDefault() }}
      onPress={unavailable ? undefined : onPress}>
      <span className="ui-state-button__surfaces" aria-hidden="true">
        {Object.entries(glassButtonSurfaces).map(([tone, surface]) => (
          <span key={tone} className={surface} data-active={tone === color} />
        ))}
      </span>
      <span ref={wrapperRef} className="ui-measured-inline ui-state-button__size" aria-hidden="true">
        <MotionSwap ref={contentRef} value={state} className="ui-state-button__content">
          {icon}
          <span>{label}</span>
        </MotionSwap>
      </span>
    </GlassButton>
  )
}
