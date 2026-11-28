import { useLayoutEffect, type RefObject } from "react"

function fitTextarea(field: HTMLTextAreaElement) {
  const scrollTop = field.scrollTop

  field.style.blockSize = "0px"
  if (field.value) field.style.blockSize = `${field.scrollHeight}px`
  field.scrollTop = scrollTop
}

export function useAutosizeTextarea(ref: RefObject<HTMLTextAreaElement>, value: string, enabled: boolean) {
  useLayoutEffect(() => {
    if (enabled && ref.current) fitTextarea(ref.current)
  }, [ref, value, enabled])

  useLayoutEffect(() => {
    const field = ref.current
    if (!enabled || !field) return

    const measure = () => fitTextarea(field)
    let width = field.offsetWidth
    const observer = new ResizeObserver(() => {
      if (field.offsetWidth === width) return
      width = field.offsetWidth
      measure()
    })
    const touchSizing = window.matchMedia("(max-width: 768px), (pointer: coarse)")
    observer.observe(field)
    touchSizing.addEventListener("change", measure)
    document.fonts?.addEventListener("loadingdone", measure)

    return () => {
      observer.disconnect()
      touchSizing.removeEventListener("change", measure)
      document.fonts?.removeEventListener("loadingdone", measure)
    }
  }, [ref, enabled])
}
