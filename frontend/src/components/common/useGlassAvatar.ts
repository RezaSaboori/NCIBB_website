import { useEffect, useRef } from "react"

import { createGlassAvatarRenderer } from "./glassAvatarRenderer"

const frameDelay = Math.ceil(1000 / 24)
const loopDuration = 10500

export function useGlassAvatar() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let inView = typeof IntersectionObserver === "undefined"
    let renderer: ReturnType<typeof createGlassAvatarRenderer> = null
    let unavailable = false
    let contextLost = false
    let timer: number | undefined
    let elapsed = 0
    let previousTime = 0

    const drawFrame = () => {
      if (!renderer) return

      const now = performance.now()

      elapsed = (elapsed + now - previousTime) % loopDuration
      previousTime = now
      renderer.draw((elapsed / loopDuration) * Math.PI * 2)
      timer = window.setTimeout(drawFrame, frameDelay)
    }

    const syncAnimation = () => {
      window.clearTimeout(timer)
      if (
        document.hidden ||
        !inView ||
        reducedMotion.matches ||
        unavailable ||
        contextLost
      )
        return

      renderer ??= createGlassAvatarRenderer(canvas)
      if (!renderer) {
        unavailable = true

        return
      }

      previousTime = performance.now()
      drawFrame()
      canvas.setAttribute("data-rendered", "")
    }

    const handleContextLost = (event: Event) => {
      event.preventDefault()
      contextLost = true
      renderer = null
      canvas.removeAttribute("data-rendered")
      syncAnimation()
    }

    const handleContextRestored = () => {
      contextLost = false
      unavailable = false
      syncAnimation()
    }

    const observer = inView
      ? undefined
      : new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting
          syncAnimation()
        })

    observer?.observe(canvas)
    canvas.addEventListener("webglcontextlost", handleContextLost)
    canvas.addEventListener("webglcontextrestored", handleContextRestored)
    document.addEventListener("visibilitychange", syncAnimation)
    reducedMotion.addEventListener("change", syncAnimation)
    syncAnimation()

    return () => {
      window.clearTimeout(timer)
      observer?.disconnect()
      renderer?.dispose()
      canvas.removeAttribute("data-rendered")
      canvas.removeEventListener("webglcontextlost", handleContextLost)
      canvas.removeEventListener("webglcontextrestored", handleContextRestored)
      document.removeEventListener("visibilitychange", syncAnimation)
      reducedMotion.removeEventListener("change", syncAnimation)
    }
  }, [])

  return canvasRef
}
