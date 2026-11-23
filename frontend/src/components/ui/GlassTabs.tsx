import { Tabs, type TabsProps } from "@heroui/react"
import { useLayoutEffect, useRef } from "react"
import "./GlassTabs.css"

export function GlassTabs(props: TabsProps) {
  const railRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const rail = railRef.current
    if (!rail) return

    const positionIndicator = () => {
      const selected = rail.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
      rail.style.setProperty("--indicator-width", `${selected?.offsetWidth ?? 0}px`)
      rail.style.setProperty("--indicator-left", `${selected?.offsetLeft ?? 0}px`)
    }

    const resize = new ResizeObserver(positionIndicator)
    const observeTabs = () => {
      resize.disconnect()
      resize.observe(rail)
      for (const tab of rail.querySelectorAll('[role="tab"]')) resize.observe(tab)
      positionIndicator()
    }
    const selection = new MutationObserver(observeTabs)
    selection.observe(rail, { subtree: true, childList: true, attributeFilter: ["aria-selected"] })
    observeTabs()
    return () => {
      selection.disconnect()
      resize.disconnect()
    }
  }, [])

  return (
    <Tabs
      {...props}
      ref={railRef}
      radius="full"
      classNames={{
        base: "ui-glass-tabs",
        tabList: "datasaz-step-tabs ui-glass-tabs__list",
        tab: "datasaz-step-tab ui-glass-tabs__tab",
        cursor: "ui-glass-tabs__cursor",
        tabContent: "ui-glass-tabs__label",
        panel: "ui-glass-tabs__panel",
      }}
      disableCursorAnimation
    />
  )
}
