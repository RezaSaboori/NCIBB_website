import type { NavigationItem } from "../types";

import { Link } from "react-router-dom";

interface NavigationLinksProps {
  items: NavigationItem[];
  pathname: string;
  showActivePill?: boolean;
  onSelect?: (value: string) => void;
}

export function NavigationLinks({
  items,
  pathname,
  showActivePill,
  onSelect,
}: NavigationLinksProps) {
  return items.map(({ value, label }) => {
    const path = value === "home" ? "/" : `/${value}`;
    const isCurrent = pathname === path;

    return (
      <Link
        key={value}
        aria-current={isCurrent ? "page" : undefined}
        className={`header-nav__item glass-navigation__item${isCurrent && showActivePill ? " blue-glass-transparent" : ""}`}
        to={path}
        onClick={() => onSelect?.(value)}
      >
        {label}
      </Link>
    );
  });
}
