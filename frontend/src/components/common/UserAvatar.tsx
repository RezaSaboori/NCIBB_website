import React, { useMemo } from "react"
import { useBlinkingEyes } from "../../hooks/useBlinkingEyes"
import "./UserAvatar.css"

const glassVariants = [
  "blue-glass",
  "green-glass",
  "red-glass",
  "orange-glass",
  "purple-glass",
  "pink-glass",
  "indigo-glass",
  "teal-glass",
  "brown-glass",
  "coral-glass",
  "amber-glass",
  "lime-glass",
  "emerald-glass",
  "sky-glass",
  "violet-glass",
  "magenta-glass",
  "rainbow-glass",
  "aurora-glass",
  "sunset-glass",
  "ocean-glass",
  "opal-glass",
  "gold-glass",
  "rosegold-glass",
  "fire-glass",
  "frost-glass",
] as const

interface UserAvatarProps {
  src?: string | null
  name?: string
  seed?: string | number | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const getGlassVariantIndex = (seed?: string | number | null) => {
  if (seed === undefined || seed === null || seed === "") {
    return Math.floor(Math.random() * glassVariants.length)
  }

  const hash = String(seed)
    .split("")
    .reduce(
      (accumulator, character) =>
        ((accumulator << 5) - accumulator + character.charCodeAt(0)) | 0,
      0,
    )

  return (hash & 0x7fffffff) % glassVariants.length
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = "User",
  seed,
  size = "md",
  className,
}) => {
  const glassVariant = useMemo(
    () => glassVariants[getGlassVariantIndex(seed)],
    [seed],
  )
  const isBlinking = useBlinkingEyes(!src)

  const avatarClasses = [
    "user-avatar",
    `user-avatar--${size}`,
    src ? "" : glassVariant,
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={avatarClasses}
      role={src ? undefined : "img"}
      aria-label={src ? undefined : name}
    >
      {src ? (
        <img src={src} alt={name} className="user-avatar__image" />
      ) : (
        <div
          className={`user-avatar__eyes${
            isBlinking ? " user-avatar__eyes--blink" : ""
          }`}
        >
          <span className="user-avatar__eye" />
          <span className="user-avatar__eye" />
        </div>
      )}
    </div>
  )
}

export default UserAvatar