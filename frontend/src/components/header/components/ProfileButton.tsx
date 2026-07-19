import { Icon } from "@iconify/react"
import { useDisclosure, Avatar } from "@heroui/react"
import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { IconButtonProps } from "../types"
import { AuthModal } from "../../auth/modal/AuthModal"

export const ProfileButton = ({
  className,
  ariaLabel,
  title,
}: Omit<IconButtonProps, "onClick">) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isAuthenticated, user } = useSelector((state: any) => state.auth)
  const location = useLocation()
  const isActive = location.pathname.startsWith("/profile")

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
              <Avatar
                src={
                  user?.profile?.profile_picture_url || "/default-profile.png"
                }
                className="header-nav__icon"
                size="sm"
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
