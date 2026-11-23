import { Link } from "react-router-dom"
import { IconButtonProps } from "../types"

export const HomeButton = ({
  className,
  ariaLabel,
  title,
}: IconButtonProps) => {
  return (
    <fieldset id="home-icon-nav" className="header-nav header-nav--icon">
      <legend className="header-nav__legend">Home</legend>
      <Link to="/">
        <button
          className={`header-nav__control ${className || ""}`}
          aria-label={ariaLabel}
          title={title}
        >
          <div className="home-icon-wrapper">
            <img
              src="/NCIBB_logo.svg"
              alt="NCIBB Logo"
              className="header-nav__icon"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </button>
      </Link>
    </fieldset>
  )
}
