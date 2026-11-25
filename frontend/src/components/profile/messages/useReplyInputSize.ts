import { useLayoutEffect, useState, type RefObject } from "react"

export function useReplyInputSize(input: RefObject<HTMLTextAreaElement>, content: string, expanded: boolean, onExpand: (value: boolean) => void) {
  const [canExpand, setCanExpand] = useState(false)

  useLayoutEffect(() => {
    const field = input.current
    if (!field) return
    const measure = () => {
      const scrollOffset = field.scrollTop
      field.style.blockSize = "0px"
      field.style.maxBlockSize = "var(--reply-collapsed-limit)"
      const naturalSize = field.scrollHeight
      const cap = Number.parseFloat(getComputedStyle(field).maxBlockSize)
      const overflowing = naturalSize > cap
      field.style.maxBlockSize = ""
      field.style.blockSize = expanded && overflowing ? "" : `${Math.min(naturalSize, cap)}px`
      field.scrollTop = scrollOffset
      setCanExpand(overflowing)
      if (expanded && !overflowing) onExpand(false)
    }

    measure()
    let width = field.offsetWidth
    const resize = new ResizeObserver(() => {
      if (width === field.offsetWidth) return
      width = field.offsetWidth
      measure()
    })
    resize.observe(field)
    document.fonts?.addEventListener("loadingdone", measure)
    return () => {
      resize.disconnect()
      document.fonts?.removeEventListener("loadingdone", measure)
    }
  }, [input, content, expanded, onExpand])

  return canExpand
}
