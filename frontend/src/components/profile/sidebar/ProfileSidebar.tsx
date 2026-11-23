import { useEffect, useRef } from "react"
import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"
import type { NavItem } from "./navItems"
import "./ProfileSidebar.css"

interface Props {
  primary: NavItem[]
  bottom: NavItem[]
  activeTab: string
  onLogout: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link to={item.id === "dashboard" ? "/profile" : `/profile?tab=${item.id}`}
      className={`sidebar-nav__item ${active ? "blue-glass" : ""}`} aria-current={active ? "page" : undefined} title={item.label} aria-label={item.label}>
      <Icon icon={item.icon} className="sidebar-nav__icon" width="20" height="20" aria-hidden />
      <span className="sidebar-nav__label">{item.label}</span>
    </Link>
  )
}

export default function ProfileSidebar({ primary, bottom, activeTab, onLogout, isCollapsed, onToggleCollapse }: Props) {
  const navigation = useRef<HTMLElement>(null)

  useEffect(() => {
    const rail = navigation.current
    const selected = rail?.querySelector("a[aria-current='page']")
    if (!rail || !selected) return

    const revealSelection = () => {
      if (rail.scrollWidth <= rail.clientWidth) return
      const railBounds = rail.getBoundingClientRect()
      const selectedBounds = selected.getBoundingClientRect()
      const left = selectedBounds.left - railBounds.left
      const right = selectedBounds.right - railBounds.right
      if (left < 0 || right > 0) rail.scrollBy({ left: left < 0 ? left : right })
    }

    revealSelection()
    const observer = new ResizeObserver(revealSelection)
    observer.observe(rail)
    for (const menu of rail.querySelectorAll(".sidebar-nav__menu")) observer.observe(menu)
    return () => observer.disconnect()
  }, [activeTab])

  return (
    <nav ref={navigation} aria-label="بخش‌های پروفایل" dir="rtl" className={`glass sidebar-nav${isCollapsed ? " sidebar-nav--collapsed" : ""}`}>
      <button type="button" className="sidebar-nav__toggle" aria-expanded={!isCollapsed} onClick={onToggleCollapse}
        aria-label={isCollapsed ? "باز کردن منو" : "جمع کردن منو"}>
        <Icon icon={isCollapsed ? "tabler:chevron-left" : "tabler:chevron-right"} width="20" height="20" aria-hidden />
      </button>
      <div className="sidebar-nav__menu">
        {primary.map((item) => <SidebarLink key={item.id} item={item} active={activeTab === item.id} />)}
      </div>
      <div className="sidebar-nav__menu sidebar-nav__bottom-menu">
        {bottom.map((item) => <SidebarLink key={item.id} item={item} active={activeTab === item.id} />)}
        <button className="sidebar-nav__item sidebar-nav__item--danger" type="button" onClick={onLogout} title="خروج" aria-label="خروج">
          <Icon icon="solar:exit-bold" className="sidebar-nav__icon" width="20" height="20" aria-hidden />
          <span className="sidebar-nav__label">خروج</span>
        </button>
      </div>
    </nav>
  )
}
