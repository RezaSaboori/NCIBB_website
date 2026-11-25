import { useSyncExternalStore } from "react"

const query = "(max-width: 960px), (max-height: 600px), (pointer: coarse), (prefers-reduced-motion: reduce)"

function subscribe(notify: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener("change", notify)
  return () => media.removeEventListener("change", notify)
}

function getSnapshot() {
  return window.matchMedia(query).matches
}

export function useLandingFlow() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}
