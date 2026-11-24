import { AnimatePresence } from "framer-motion"
import { forwardRef, type ReactNode } from "react"
import { MotionSwapFace } from "./MotionSwapFace"
import { useMotionVariants } from "./useMotionVariants"
import "./MotionSwap.css"

type MotionSwapProps = {
  value: string | number
  children: ReactNode
  className?: string
}

export const MotionSwap = forwardRef<HTMLSpanElement, MotionSwapProps>(
  function MotionSwap({ value, children, className = "" }, ref) {
    const variants = useMotionVariants("replace")

    return (
      <span ref={ref} className={`ui-motion-swap ${className}`}>
        <AnimatePresence initial={false}>
          <MotionSwapFace key={value} variants={variants}>{children}</MotionSwapFace>
        </AnimatePresence>
      </span>
    )
  },
)
