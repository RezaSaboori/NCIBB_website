import React, { useEffect, useRef } from "react"
import { Icon } from "@iconify/react"
import { primaryNavItems, bottomNavItems } from "./navItems"
import { ChevronIcon } from "../../../pages/dataset/datasaz/components/step2/icons/Step2Icons"
import "./ProfileSidebar.css"

interface ProfileSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  isCollapsed,
  onToggleCollapse,
}) => {
  const sidebarRef = useRef<HTMLFieldSetElement>(null)

  useEffect(() => {
    const container = sidebarRef.current
    if (!container) return

    const updateActiveIndicator = (menu: HTMLElement) => {
      const activeItem = menu.querySelector(
        ".sidebar-nav__item:has(input:checked)"
      ) as HTMLElement | null

      if (!activeItem) {
        menu.style.setProperty("--active-indicator-height", "0px")
        menu.style.setProperty("--active-indicator-top", "0px")
        return
      }

      menu.style.setProperty("--active-indicator-height", `${activeItem.offsetHeight}px`)
      menu.style.setProperty("--active-indicator-top", `${activeItem.offsetTop}px`)
    }

    const runAll = () => {
      container.querySelectorAll<HTMLElement>(".sidebar-nav__menu").forEach(updateActiveIndicator)
    }

    // Run immediately, then after the CSS transition completes (width/padding animation)
    runAll()
    const transitionTimer = setTimeout(runAll, 320)

    const resizeObserver = new ResizeObserver(runAll)
    resizeObserver.observe(container)

    return () => {
      clearTimeout(transitionTimer)
      resizeObserver.disconnect()
    }
  }, [activeTab, isCollapsed])

  return (
    <fieldset
      ref={sidebarRef}
      className={`sidebar-nav${isCollapsed ? " sidebar-nav--collapsed" : ""}`}
    >
      <legend className="sidebar-nav__legend">Profile Navigation</legend>

      <button
        className="sidebar-nav__toggle"
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        type="button"
      >
        <ChevronIcon
          className={`sidebar-nav__toggle-icon${isCollapsed ? " sidebar-nav__toggle-icon--flipped" : ""}`}
        />
      </button>

      <div className="sidebar-nav__menu">
        {primaryNavItems.map((item) => (
          <label
            className="sidebar-nav__item"
            key={item.id}
            title={isCollapsed ? item.label : undefined}
          >
            <input
              className="sidebar-nav__input"
              type="radio"
              name="profile-nav"
              value={item.id}
              checked={activeTab === item.id}
              onChange={() => onTabChange(item.id)}
            />
            <Icon icon={item.icon} className="sidebar-nav__icon" width="20" height="20" />
            {!isCollapsed && <span>{item.label}</span>}
          </label>
        ))}
      </div>

      <div className="sidebar-nav__menu sidebar-nav__bottom-menu">
        {bottomNavItems.map((item) => (
          <label
            className="sidebar-nav__item"
            key={item.id}
            title={isCollapsed ? item.label : undefined}
          >
            <input
              className="sidebar-nav__input"
              type="radio"
              name="profile-nav"
              value={item.id}
              checked={activeTab === item.id}
              onChange={() => onTabChange(item.id)}
            />
            <Icon icon={item.icon} className="sidebar-nav__icon" width="20" height="20" />
            {!isCollapsed && <span>{item.label}</span>}
          </label>
        ))}

        <label
          className="sidebar-nav__item sidebar-nav__item--danger"
          onClick={onLogout}
          title={isCollapsed ? "خروج" : undefined}
        >
          <input
            className="sidebar-nav__input"
            type="radio"
            name="profile-nav"
            value="exit"
            readOnly
          />
          <Icon icon="solar:exit-bold" className="sidebar-nav__icon" width="20" height="20" />
          {!isCollapsed && <span>خروج</span>}
        </label>
      </div>
    </fieldset>
  )
}

export default ProfileSidebar