import { useEffect, useState, type RefObject } from "react"

export function useCompactCardioProgress(
  visualRef: RefObject<HTMLDivElement>,
  introRef: RefObject<HTMLDivElement>,
  detailsRef: RefObject<HTMLDivElement>,
  enabled: boolean,
) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const visual = visualRef.current
    const intro = introRef.current
    const details = detailsRef.current
    if (!enabled || !visual || !intro || !details) return

    let frame = 0
    const measure = () => {
      frame = 0
      const visualRect = visual.getBoundingClientRect()
      const introRect = intro.getBoundingClientRect()
      const detailsTop = details.getBoundingClientRect().top
      const gapCenter = (introRect.bottom + detailsTop) / 2
      const distance = Math.max(1, gapCenter + visualRect.height / 2 - introRect.top)

      setProgress(Math.min(1, Math.max(0, (visualRect.bottom - introRect.top) / distance)))
    }
    const scheduleMeasure = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    const resize = new ResizeObserver(scheduleMeasure)
    resize.observe(visual)
    resize.observe(intro)
    window.addEventListener("scroll", scheduleMeasure, { passive: true })
    measure()

    return () => {
      resize.disconnect()
      window.removeEventListener("scroll", scheduleMeasure)
      cancelAnimationFrame(frame)
    }
  }, [detailsRef, enabled, introRef, visualRef])

  return enabled ? progress : 0
}
