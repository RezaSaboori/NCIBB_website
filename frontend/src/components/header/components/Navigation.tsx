import { Link, useLocation } from "react-router-dom"
import { NavigationProps } from "../types"

export const Navigation = ({ items, className }: NavigationProps) => {
  const location = useLocation()

  return (
    <fieldset className="header-nav header-nav--main glass-transparent">
      <legend className="header-nav__legend">Main navigation</legend>
      <div className={`header-nav__menu ${className || ""}`}>
        {items.map((item) => (
          <Link
            key={item.value}
            to={`/${item.value === "home" ? "" : item.value}`}
            className="header-nav__item"
          >
            <input
              className="header-nav__input"
              type="radio"
              name="nav-item"
              value={item.value}
              checked={
                location.pathname ===
                `/${item.value === "home" ? "" : item.value}`
              }
              readOnly
            />
            {item.label}
          </Link>
        ))}
      </div>
    </fieldset>
  )
}
