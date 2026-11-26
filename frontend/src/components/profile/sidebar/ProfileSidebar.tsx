import { Icon } from "@iconify/react"
import { ProfileSidebarLink } from "./ProfileSidebarLink"
import { profileNavIcons } from "./profileNavIcons"
import { useProfileRail } from "./useProfileRail"
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

export default function ProfileSidebar({ primary, bottom, activeTab, onLogout, isCollapsed, onToggleCollapse }: Props) {
  const { navigation, revealItem } = useProfileRail(activeTab, primary.length + bottom.length)

  return (
    <div className="sidebar-nav-frame glass-navigation glass-transparent">
      <nav ref={navigation} aria-label="بخش‌های پروفایل" dir="rtl" className={`glass custom-scrollbar sidebar-nav${isCollapsed ? " sidebar-nav--collapsed" : ""}`}
        onFocus={(event) => revealItem(event.currentTarget, event.target)}>
        <button type="button" className="sidebar-nav__toggle" aria-expanded={!isCollapsed} onClick={onToggleCollapse}
          aria-label={isCollapsed ? "باز کردن منو" : "جمع کردن منو"}>
          <Icon icon={isCollapsed ? profileNavIcons.expand : profileNavIcons.collapse} className="sidebar-nav__icon" aria-hidden />
        </button>
        <div className="sidebar-nav__menu">
          {primary.map((item) => <ProfileSidebarLink key={item.id} item={item} active={activeTab === item.id} />)}
        </div>
        <div className="sidebar-nav__menu sidebar-nav__bottom-menu">
          {bottom.map((item) => <ProfileSidebarLink key={item.id} item={item} active={activeTab === item.id} />)}
          <button className="sidebar-nav__item glass-navigation__item sidebar-nav__item--danger" type="button" onClick={onLogout} title="خروج" aria-label="خروج">
            <Icon icon={profileNavIcons.logout} className="sidebar-nav__icon" aria-hidden />
            <span className="sidebar-nav__label">خروج</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
