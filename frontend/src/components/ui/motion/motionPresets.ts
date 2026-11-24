import type { Transition, Variants } from "framer-motion"

export const motionSettle: Transition = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 }
const easeOut = [0.2, 0.8, 0.2, 1] as const
export const motionEasing = `cubic-bezier(${easeOut.join(",")})`
export const dialogResizeDuration = 0.24
const clearOptics = "blur(0px) brightness(1)"

export const fadeMotion: Variants = {
  enter: {
    opacity: 1, scale: 1, y: 0, filter: "none",
    transition: { duration: 0, opacity: { duration: 0.12, ease: "easeOut" } },
  },
  exit: {
    opacity: 0, scale: 1, y: 0, filter: "none",
    transition: { duration: 0, opacity: { duration: 0.09, ease: "easeIn" } },
  },
}

const replace: Variants = {
  enter: {
    opacity: 1, scale: 1, filter: clearOptics,
    transition: { duration: 0.22, ease: easeOut },
    transitionEnd: { filter: "none" },
  },
  exit: {
    opacity: 0, scale: 0.96, filter: "blur(4px) brightness(1.2)",
    transition: { duration: 0.13, ease: "easeOut" },
  },
}

const surface: Variants = {
  enter: {
    opacity: 1, scale: 1, y: 0,
    transition: { ...motionSettle, opacity: { duration: 0.18, ease: "easeOut" } },
  },
  exit: {
    opacity: 0, scale: 0.98, y: 4,
    transition: { duration: 0.16, ease: "easeIn" },
  },
}

const dialog: Variants = {
  enter: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
}

const notification: Variants = {
  enter: {
    opacity: 1, scale: 1, y: 0, filter: clearOptics,
    transition: {
      ...motionSettle,
      opacity: { duration: 0.17, ease: easeOut },
      filter: { duration: 0.2, ease: easeOut },
    },
    transitionEnd: { filter: "none" },
  },
  exit: {
    opacity: 0, scale: 0.97, y: 6, filter: "blur(5px) brightness(1.28)",
    transition: { duration: 0.16, ease: "easeIn" },
  },
}

export const motionPresets = { replace, surface, dialog, notification }
