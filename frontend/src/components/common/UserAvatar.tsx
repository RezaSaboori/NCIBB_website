import { GlassAvatar } from "./GlassAvatar"

import "./UserAvatar.css"

interface UserAvatarProps {
  src?: string | null
  name?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function UserAvatar({
  src,
  name = "User",
  size = "md",
  className,
}: UserAvatarProps) {
  const classes = [
    "user-avatar",
    `user-avatar--${size}`,
    src ? undefined : "user-avatar--glass",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  if (src) {
    return (
      <span className={classes}>
        <img alt={name} className="user-avatar__image" src={src} />
      </span>
    )
  }

  const resolution = size === "lg" ? 128 : 64

  return (
    <span aria-label={name} className={classes} role="img">
      <GlassAvatar key={resolution} resolution={resolution} />
    </span>
  )
}
