import React, { useEffect } from "react"
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
  useEffect(() => {
    if (isCollapsed) return

    const navMenus = document.querySelectorAll(".sidebar-nav__menu")

    const updateActiveIndicator = (menu: Element) => {
      const activeItem = menu.querySelector(
        ".sidebar-nav__item:has(input:checked)"
      ) as HTMLElement
      if (!activeItem) {
        ;(menu as HTMLElement).style.setProperty("--active-indicator-height", "0px")
        return
      }
      ;(menu as HTMLElement).style.setProperty(
        "--active-indicator-height",
        `${activeItem.offsetHeight}px`
      )
      ;(menu as HTMLElement).style.setProperty(
        "--active-indicator-top",
        `${activeItem.offsetTop}px`
      )
    }

    if (navMenus.length > 0) {
      navMenus.forEach((menu) => updateActiveIndicator(menu))
      const resizeObserver = new ResizeObserver(() =>
        navMenus.forEach((menu) => updateActiveIndicator(menu))
      )
      resizeObserver.observe(document.body)
      return () => resizeObserver.disconnect()
    }
  }, [activeTab, isCollapsed])

  return (
    <fieldset className={`sidebar-nav${isCollapsed ? " sidebar-nav--collapsed" : ""}`}>
      <legend className="sidebar-nav__legend">Profile Navigation</legend>

      {/* Collapse toggle button */}
      <button
        className="sidebar-nav__toggle"
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        type="button"
      >
        <ChevronIcon className={`sidebar-nav__toggle-icon${isCollapsed ? " sidebar-nav__toggle-icon--flipped" : ""}`} />
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