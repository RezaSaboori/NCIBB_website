import { useCallback, useLayoutEffect, useRef, type Key } from "react"

export function useMeasuredSize<T extends HTMLElement>(axis: "block" | "inline", contentKey?: Key) {
  const wrapperRef = useRef<T>(null)
  const contentRef = useRef<T>(null)

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current
    const content = contentRef.current
    if (!wrapper || !content) return
    // Layout measurements exclude the fade and scale on the content.
    const size = axis === "block" ? content.offsetHeight : content.offsetWidth
    wrapper.style.setProperty("--motion-measured-size", `${size}px`)
  }, [axis])

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const content = contentRef.current
    if (!wrapper || !content || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(measure)
    observer.observe(content)
    return () => {
      observer.disconnect()
      wrapper.style.removeProperty("--motion-measured-size")
    }
  }, [measure])

  useLayoutEffect(() => {
    if (typeof ResizeObserver !== "undefined") measure()
  }, [contentKey, measure])

  return { wrapperRef, contentRef }
}
