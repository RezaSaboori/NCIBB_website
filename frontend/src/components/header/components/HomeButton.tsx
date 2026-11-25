import { Link } from "react-router-dom"
import { IconButtonProps } from "../types"

export const HomeButton = ({
  className,
  ariaLabel,
  title,
}: IconButtonProps) => {
  return (
    <div id="home-icon-nav" className="header-nav header-nav--icon glass-navigation glass-transparent">
      <Link to="/" className={`header-nav__control ${className || ""}`} aria-label={ariaLabel} title={title}>
        <span className="home-icon-wrapper">
          <img src="/NCIBB_logo.svg" alt="" className="header-nav__icon" />
        </span>
      </Link>
    </div>
  )
}
