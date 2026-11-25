import { useLayoutEffect, type RefObject } from "react"

export function useActiveIndicator(menu: RefObject<HTMLDivElement>, pathname: string) {
  useLayoutEffect(() => {
    const rail = menu.current
    if (!rail) return
    const activeItem = rail.querySelector<HTMLElement>("[aria-current='page']")
    rail.style.setProperty("--active-indicator-opacity", activeItem ? "1" : "0")
    if (!activeItem) return

    const updateIndicator = () => {
      rail.style.setProperty("--active-indicator-width", `${activeItem.offsetWidth}px`)
      rail.style.setProperty("--active-indicator-left", `${activeItem.offsetLeft}px`)
    }

    updateIndicator()
    const observer = new ResizeObserver(updateIndicator)
    observer.observe(rail)
    observer.observe(activeItem)
    return () => observer.disconnect()
  }, [menu, pathname])
}
