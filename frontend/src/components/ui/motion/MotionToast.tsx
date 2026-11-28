import { motion, useIsPresent } from "framer-motion"
import { forwardRef, useEffect, useState } from "react"
import { CloseButton } from "../iconButtons"
import { motionSettle } from "./motionPresets"
import { useMotionVariants } from "./useMotionVariants"
import type { ToastItem } from "./useToast"

type MotionToastProps = {
  item: ToastItem
  reducedMotion: boolean
  onDismiss: (id: number) => void
}

export const MotionToast = forwardRef<HTMLLIElement, MotionToastProps>(
  function MotionToast({ item, reducedMotion, onDismiss }, ref) {
    const isPresent = useIsPresent()
    const variants = useMotionVariants("notification")
    const [hovered, setHovered] = useState(false)
    const [focused, setFocused] = useState(false)
    const { id, message, tone } = item

    useEffect(() => {
      if (tone === "error" || hovered || focused || !isPresent) return
      const timeout = window.setTimeout(() => onDismiss(id), 5500)
      return () => window.clearTimeout(timeout)
    }, [focused, hovered, id, isPresent, onDismiss, tone])

    return (
      <motion.li ref={ref} layout={reducedMotion ? false : "position"} transition={{ layout: motionSettle }}
        className="ui-toast" aria-hidden={!isPresent || undefined}
        initial="exit" animate="enter" exit="exit" variants={variants}
        onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)} onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
        }}>
        <div className="glass ui-toast__surface" data-tone={tone}>
          <svg className="ui-toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d={tone === "success" ? "m8 12 2.5 2.5L16 9" : "M12 8v4m0 4h.01"} />
          </svg>
          <p dir="auto">{message}</p>
          <CloseButton size="var(--spacing-xl)" className="ui-glass-icon-button--touch" disabled={!isPresent}
            aria-label="بستن اعلان" onClick={() => onDismiss(id)} />
        </div>
      </motion.li>
    )
  },
)
