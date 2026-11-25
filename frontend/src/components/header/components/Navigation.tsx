import { useRef } from "react"
import { useLocation } from "react-router-dom"
import { useActiveIndicator } from "../hooks/useActiveIndicator"
import type { NavigationProps } from "../types"
import { MobileNavigation } from "./MobileNavigation"
import { NavigationLinks } from "./NavigationLinks"

export const Navigation = ({ items, className, onItemChange, onProfileSignIn }: NavigationProps) => {
  const { pathname, key } = useLocation()
  const menu = useRef<HTMLDivElement>(null)
  useActiveIndicator(menu, pathname)

  return (
    <>
      <nav aria-label="پیمایش اصلی" className="header-nav header-nav--main glass-navigation glass-transparent">
        <div ref={menu} className={`header-nav__menu glass-navigation__indicator ${className || ""}`}>
          <NavigationLinks items={items} pathname={pathname} onSelect={onItemChange} />
        </div>
      </nav>
      <MobileNavigation
        items={items}
        pathname={pathname}
        locationKey={key}
        onProfileSignIn={onProfileSignIn}
        onSelect={onItemChange}
      />
    </>
  )
}
