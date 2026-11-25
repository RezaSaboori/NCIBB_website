import { useEffect } from "react"

const refreshIntervalMs = 4000

export function useMessagingRefresh(refresh: () => void) {
  useEffect(() => {
    const refreshVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine) refresh()
    }

    const timer = window.setInterval(refreshVisible, refreshIntervalMs)
    document.addEventListener("visibilitychange", refreshVisible)
    window.addEventListener("focus", refreshVisible)
    window.addEventListener("online", refreshVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", refreshVisible)
      window.removeEventListener("focus", refreshVisible)
      window.removeEventListener("online", refreshVisible)
    }
  }, [refresh])
}
