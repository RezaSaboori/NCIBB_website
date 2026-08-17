import { useMemo } from "react"
import { Icon } from "@iconify/react"
import { useDisclosure } from "@heroui/react"
import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { IconButtonProps } from "../types"
import { AuthModal } from "../../auth/modal/AuthModal"
import UserAvatar from "../../common/UserAvatar"
import { getUserIdFromAccessToken } from "../../../utils/authToken"

export const ProfileButton = ({
  className,
  ariaLabel,
  title,
}: Omit<IconButtonProps, "onClick">) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isAuthenticated, user } = useSelector((state: any) => state.auth)
  const location = useLocation()
  const isActive = location.pathname.startsWith("/profile")
  const tokenUserId = useMemo(
    () => getUserIdFromAccessToken(),
    [isAuthenticated, user?.id],
  )

  return (
    <>
      <fieldset
        className={`header-nav header-nav--icon glass-transparent ${
          isAuthenticated ? "is-authenticated" : ""
        }`}
      >
        <legend className="header-nav__legend">User Profile</legend>
        {isAuthenticated ? (
          <Link to="/profile">
            <button
              className={`header-nav__control ${isActive ? "header-nav__control--active" : ""} ${className || ""}`}
              aria-label={ariaLabel}
              title={title}
            >
              <UserAvatar
                src={user?.profile?.profile_picture_url}
                name={user?.profile?.full_name || user?.email || "User"}
                seed={user?.id ?? tokenUserId ?? user?.email}
                size="sm"
                className="header-nav__avatar"
              />
            </button>
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
