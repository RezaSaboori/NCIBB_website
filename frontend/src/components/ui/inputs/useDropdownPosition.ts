import { useLayoutEffect, type RefObject } from "react"

export function useDropdownPosition(
  triggerRef: RefObject<HTMLButtonElement>,
  panelRef: RefObject<HTMLDivElement>,
  portalContainer: Element | null,
) {
  useLayoutEffect(() => {
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel || !portalContainer) return

    const position = () => {
      const triggerRect = trigger.getBoundingClientRect()
      const dialogRect = portalContainer === document.body ? null : portalContainer.getBoundingClientRect()
      const gap = 6
      const viewportHeight = document.documentElement.clientHeight
      const spaceBelow = viewportHeight - Math.max(triggerRect.bottom, 0) - 2 * gap
      const spaceAbove = Math.min(triggerRect.top, viewportHeight) - 2 * gap
      const above = spaceBelow < Math.min(panel.scrollHeight, 300) && spaceAbove > spaceBelow
      const anchor = above ? triggerRect.top - gap : triggerRect.bottom + gap
      panel.style.position = dialogRect ? "absolute" : "fixed"
      panel.style.left = `${triggerRect.left - (dialogRect?.left ?? 0)}px`
      panel.style.width = `${triggerRect.width}px`
      panel.style.top = `${anchor - (dialogRect?.top ?? 0)}px`
      panel.style.translate = above ? "0 -100%" : ""
      panel.style.maxHeight = `${Math.max(0, above ? spaceAbove : spaceBelow)}px`
      panel.style.direction = getComputedStyle(trigger).direction
    }

    position()
    const observer = new ResizeObserver(position)
    observer.observe(trigger)
    window.addEventListener("resize", position)
    window.addEventListener("scroll", position, true)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", position)
      window.removeEventListener("scroll", position, true)
    }
  }, [portalContainer, triggerRef, panelRef])
}
