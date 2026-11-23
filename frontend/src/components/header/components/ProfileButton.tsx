import type { RootState } from "@/store/store"
import type { IconButtonProps } from "../types"

import { Icon } from "@iconify/react"
import { useDisclosure } from "@heroui/react"
import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"

import { AuthModal } from "../../auth/modal/AuthModal"
import UserAvatar from "../../common/UserAvatar"

export const ProfileButton = ({
  className,
  ariaLabel,
  title,
}: Omit<IconButtonProps, "onClick">) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  )
  const location = useLocation()
  const isActive = location.pathname === "/profile"
  const photo = user?.profile?.profile_picture_url
  const avatarName = user?.profile?.full_name || user?.email || "کاربر"

  return (
    <>
      <fieldset
        className={`header-nav header-nav--icon glass-transparent ${
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
            className={`header-nav__control ${isActive ? "header-nav__control--active" : ""} ${className || ""}`}
            aria-label={ariaLabel}
            title={title}
            onClick={onOpen}
          >
            <div className="profile-icon-wrapper">
              <Icon
                icon="typcn:user"
                className="header-nav__icon"
                width="100%"
                height="100%"
              />
            </div>
          </button>
        )}
      </fieldset>
      <AuthModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  )
}
