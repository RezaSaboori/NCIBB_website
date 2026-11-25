import type { NavItem } from "./navItems";

import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

export function ProfileSidebarLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={`sidebar-nav__item glass-navigation__item${active ? " blue-glass" : ""}`}
      title={item.label}
      to={item.id === "dashboard" ? "/profile" : `/profile?tab=${item.id}`}
    >
      <Icon aria-hidden className="sidebar-nav__icon" icon={item.icon} />
      <span className="sidebar-nav__label">{item.label}</span>
    </Link>
  );
}
