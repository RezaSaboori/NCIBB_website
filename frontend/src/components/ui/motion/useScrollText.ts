import { useEffect, useRef } from "react"
import "./scrollText.css"

export function useScrollText<W extends HTMLElement, I extends HTMLElement>() {
  const wrapperRef = useRef<W>(null)
  const innerRef = useRef<I>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const inner = innerRef.current
    if (!wrapper || !inner) return

    const measure = () => {
      const overflow = Math.max(0, inner.scrollWidth - wrapper.clientWidth)
      wrapper.style.setProperty("--scroll-distance", `${overflow}px`)
      wrapper.dataset.scrollOverflow = String(overflow > 0)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(wrapper)
    observer.observe(inner)
    return () => observer.disconnect()
  }, [])

  return { wrapperRef, innerRef }
}
