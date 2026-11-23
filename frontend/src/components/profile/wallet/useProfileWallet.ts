import { useEffect } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store/store"
import { fetchWallet } from "@/store/walletSlice"

export function useProfileWallet(enabled: boolean) {
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    if (!enabled) return
    const refresh = () => { if (document.visibilityState === "visible") void dispatch(fetchWallet()) }

    refresh()
    document.addEventListener("visibilitychange", refresh)
    window.addEventListener("focus", refresh)
    const timer = window.setInterval(refresh, 60_000)
    return () => {
      document.removeEventListener("visibilitychange", refresh)
      window.removeEventListener("focus", refresh)
      window.clearInterval(timer)
    }
  }, [dispatch, enabled])
}
