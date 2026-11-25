import type { RootState } from "@/store/store"
import type { IconButtonProps } from "../types"

import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"

import UserAvatar from "../../common/UserAvatar"

interface ProfileButtonProps extends Omit<IconButtonProps, "onClick"> {
  onSignIn: () => void
}

export const ProfileButton = ({
  className,
  ariaLabel,
  title,
  onSignIn,
}: ProfileButtonProps) => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  )
  const location = useLocation()
  const isActive = location.pathname === "/profile"
  const photo = user?.profile?.profile_picture_url
  const avatarName = user?.profile?.full_name || user?.email || "کاربر"

  return (
    <fieldset
      className={`header-nav header-nav--icon glass-navigation glass-transparent ${
        isAuthenticated ? "is-authenticated" : ""
      }`}
    >
      <legend className="header-nav__legend">User Profile</legend>
      {isAuthenticated ? (
        <Link
          to="/profile"
          className={`header-nav__control ${isActive ? "header-nav__control--active" : ""} ${className || ""}`}
          aria-label={ariaLabel}
          aria-current={isActive ? "page" : undefined}
          title={title}
        >
          <UserAvatar
            className="header-nav__avatar"
            name={avatarName}
            size="sm"
            src={photo}
          />
        </Link>
      ) : (
        <button
          type="button"
          className={`header-nav__control ${isActive ? "header-nav__control--active" : ""} ${className || ""}`}
          aria-label={ariaLabel}
          title={title}
          onClick={onSignIn}
        >
          <span className="profile-icon-wrapper">
            <svg
              aria-hidden="true"
              className="header-nav__icon"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="8" r="3.25" />
              <path d="M5 20v-1.25A4.75 4.75 0 0 1 9.75 14h4.5A4.75 4.75 0 0 1 19 18.75V20Z" />
            </svg>
          </span>
        </button>
      )}
    </fieldset>
  )
}
