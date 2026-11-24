import { useSyncExternalStore } from "react"

const query = "(prefers-reduced-motion: reduce)"

function subscribe(notify: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener("change", notify)
  return () => media.removeEventListener("change", notify)
}

function getPreference() {
  return window.matchMedia(query).matches
}

export function useReducedMotionPreference() {
  return useSyncExternalStore(subscribe, getPreference, () => false)
}
