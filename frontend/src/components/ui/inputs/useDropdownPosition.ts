import { useLayoutEffect, type RefObject } from "react"

export function useDropdownPosition(
  triggerRef: RefObject<HTMLButtonElement>,
  panelRef: RefObject<HTMLDivElement>,
  portalContainer: Element | null,
  optionCount: number,
  error?: string,
) {
  useLayoutEffect(() => {
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel || !portalContainer) return
    const viewport = window.visualViewport

    const position = () => {
      const triggerRect = trigger.getBoundingClientRect()
      const dialogRect = portalContainer === document.body ? null : portalContainer.getBoundingClientRect()
      const gap = 6
      const left = viewport?.offsetLeft ?? 0
      const top = viewport?.offsetTop ?? 0
      const right = left + (viewport?.width ?? document.documentElement.clientWidth)
      const bottom = top + (viewport?.height ?? document.documentElement.clientHeight)
      const spaceBelow = bottom - Math.max(triggerRect.bottom, top) - 2 * gap
      const spaceAbove = Math.min(triggerRect.top, bottom) - top - 2 * gap
      const above = spaceBelow < Math.min(panel.scrollHeight, 300) && spaceAbove > spaceBelow
      const anchor = above ? Math.min(triggerRect.top, bottom) - gap : Math.max(triggerRect.bottom, top) + gap
      const width = Math.max(0, Math.min(triggerRect.width, right - left - 2 * gap))
      const horizontalAnchor = Math.max(left + gap, Math.min(triggerRect.left, right - width - gap))
      panel.style.position = dialogRect ? "absolute" : "fixed"
      panel.style.left = `${horizontalAnchor - (dialogRect?.left ?? 0)}px`
      panel.style.width = `${width}px`
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
    viewport?.addEventListener("resize", position)
    viewport?.addEventListener("scroll", position)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", position)
      window.removeEventListener("scroll", position, true)
      viewport?.removeEventListener("resize", position)
      viewport?.removeEventListener("scroll", position)
    }
  }, [portalContainer, triggerRef, panelRef, optionCount, error])
}
