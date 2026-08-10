import { useEffect, useState } from "react"

export const useBlinkingEyes = (enabled = true) => {
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setIsBlinking(false)
      return
    }

    const timeoutIds: number[] = []

    const scheduleTimeout = (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(callback, delay)
      timeoutIds.push(timeoutId)
    }

    const triggerBlink = () => {
      setIsBlinking(true)
      scheduleTimeout(() => setIsBlinking(false), 220)

      if (Math.random() < 0.15) {
        scheduleTimeout(() => {
          setIsBlinking(true)
          scheduleTimeout(() => setIsBlinking(false), 220)
        }, 260 + Math.random() * 120)
      }

      scheduleTimeout(triggerBlink, 2000 + Math.random() * 4500)
    }

    scheduleTimeout(triggerBlink, 2000 + Math.random() * 4500)

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [enabled])

  return isBlinking
}
