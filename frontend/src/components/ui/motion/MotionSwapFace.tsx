import { motion, useIsPresent, type Variants } from "framer-motion"
import type { ReactNode } from "react"

export function MotionSwapFace({ children, variants }: { children: ReactNode; variants: Variants }) {
  const isPresent = useIsPresent()

  return (
    <motion.span className="ui-motion-swap__face" aria-hidden={!isPresent || undefined}
      initial="exit" animate="enter" exit="exit" variants={variants}>
      {children}
    </motion.span>
  )
}
