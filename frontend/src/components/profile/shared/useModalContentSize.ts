import { useLayoutEffect, useRef } from "react"

export function useModalContentSize() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const content = contentRef.current
    if (!wrapper || !content) return

    const update = () => { wrapper.style.blockSize = `${content.offsetHeight}px` }
    const observer = new ResizeObserver(update)
    update()
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  return { wrapperRef, contentRef }
}
