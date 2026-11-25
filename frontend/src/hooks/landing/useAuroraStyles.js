import { useEffect, useState } from "react"
import { ANIMATION_CONFIG } from "../../config/landing/constants"

export function useAuroraStyles(animated) {
  const [auroraVisible, setAuroraVisible] = useState(false)

  useEffect(() => {
    if (!animated) return

    const timer = window.setTimeout(() => {
      setAuroraVisible(true)
    }, ANIMATION_CONFIG.AURORA_DELAY)

    return () => window.clearTimeout(timer)
  }, [animated])

  return !animated || auroraVisible
}
