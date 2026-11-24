import { useLayoutEffect, useRef } from "react"
import { motionEasing } from "./motionPresets"
import { useReducedMotionPreference } from "./useReducedMotionPreference"

export function useNavigationFade(pathname: string, enabled = true) {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotionPreference()

  useLayoutEffect(() => {
    if (!enabled || !ref.current?.animate) return
    const animation = ref.current.animate(
      { opacity: [reducedMotion ? 0.75 : 0.55, 1] },
      { duration: reducedMotion ? 90 : 190, easing: motionEasing },
    )
    return () => animation.cancel()
  }, [enabled, pathname, reducedMotion])

  return ref
}
