import { useEffect, useState } from "react"

type Blink = "single" | "double"

export function useBlinkingEyes() {
  const [blink, setBlink] = useState<Blink | null>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let timer: number | undefined

    const scheduleBlink = () => {
      setBlink(null)
      timer = window.setTimeout(closeEyes, 2000 + Math.random() * 4500)
    }

    const closeEyes = () => {
      const doubleBlink = Math.random() < 0.15

      setBlink(doubleBlink ? "double" : "single")
      timer = window.setTimeout(scheduleBlink, doubleBlink ? 450 : 230)
    }

    const syncBlinking = () => {
      window.clearTimeout(timer)
      if (document.hidden || reducedMotion.matches) {
        setBlink(null)
      } else {
        scheduleBlink()
      }
    }

    document.addEventListener("visibilitychange", syncBlinking)
    reducedMotion.addEventListener("change", syncBlinking)
    syncBlinking()

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("visibilitychange", syncBlinking)
      reducedMotion.removeEventListener("change", syncBlinking)
    }
  }, [])

  return blink
}
