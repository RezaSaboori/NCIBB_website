import { Tabs, type TabsProps } from "@heroui/react"
import { createContext, forwardRef, useContext, useLayoutEffect, useRef, type ComponentPropsWithoutRef } from "react"
import { createPortal } from "react-dom"
import "./GlassTabs.css"

const TabRailTarget = createContext<HTMLElement | undefined>(undefined)

const PortaledTabRail = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  function PortaledTabRail(props, ref) {
    const target = useContext(TabRailTarget)
    return target ? createPortal(
      <div className="ui-glass-tabs glass-navigation glass-transparent glass-transparent--scroll custom-scrollbar"><div {...props} ref={ref} /></div>,
      target,
    ) : null
  },
)

export function GlassTabs({ railTarget, animatePanel, ...props }: TabsProps & { railTarget?: HTMLElement; animatePanel?: boolean }) {
  const railRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const scrollHost = rail.closest<HTMLElement>(".ui-glass-tabs")

    const positionIndicator = () => {
      const selected = rail.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
      const width = selected?.offsetWidth ?? 0
      const left = selected?.offsetLeft ?? 0
      rail.style.setProperty("--active-indicator-width", `${width}px`)
      rail.style.setProperty("--active-indicator-left", `${left}px`)
      rail.style.setProperty("--active-indicator-opacity", selected ? "1" : "0")
      if (!selected || !scrollHost?.clientWidth || scrollHost.scrollWidth <= scrollHost.clientWidth) return
      const viewport = scrollHost.getBoundingClientRect()
      const tab = selected.getBoundingClientRect()
      const inset = parseFloat(getComputedStyle(scrollHost).paddingInlineStart)
      const leftEdge = viewport.left + inset
      const rightEdge = viewport.right - inset
      if (tab.left < leftEdge) scrollHost.scrollBy({ left: tab.left - leftEdge })
      else if (tab.right > rightEdge) scrollHost.scrollBy({ left: tab.right - rightEdge })
    }

    const resize = new ResizeObserver(positionIndicator)
    const observeTabs = () => {
      resize.disconnect()
      resize.observe(rail)
      if (scrollHost && scrollHost !== rail) resize.observe(scrollHost)
      for (const tab of rail.querySelectorAll('[role="tab"]')) resize.observe(tab)
      positionIndicator()
    }
    const selection = new MutationObserver((records) => {
      if (records.some((record) => record.type === "childList")) observeTabs()
      else positionIndicator()
    })
    selection.observe(rail, { subtree: true, childList: true, attributeFilter: ["aria-selected"] })
    observeTabs()
    return () => {
      selection.disconnect()
      resize.disconnect()
    }
  }, [railTarget])

  return (
    <TabRailTarget.Provider value={railTarget}>
      <Tabs
        {...props}
        as={railTarget ? PortaledTabRail : props.as}
        ref={railRef}
        radius="full"
        classNames={{
          base: railTarget ? "ui-glass-tabs__placeholder" : "ui-glass-tabs glass-navigation glass-transparent glass-transparent--scroll custom-scrollbar",
          tabList: `datasaz-step-tabs ui-glass-tabs__list glass-navigation__indicator${animatePanel ? " ui-glass-tabs__list--animated" : ""}`,
          tab: "datasaz-step-tab ui-glass-tabs__tab glass-navigation__item",
          cursor: "ui-glass-tabs__cursor",
          tabContent: "ui-glass-tabs__label",
          panel: `ui-glass-tabs__panel${animatePanel ? " ui-panel-reveal" : ""}`,
        }}
        disableCursorAnimation
      />
    </TabRailTarget.Provider>
  )
}
