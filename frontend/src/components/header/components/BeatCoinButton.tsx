import { useEffect } from "react"
import { Icon } from "@iconify/react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useLocation } from "react-router-dom"
import { formatCoins } from "@/components/profile/shared/accountFormat"
import type { AppDispatch, RootState } from "@/store/store"
import { fetchWallet } from "@/store/walletSlice"

export function BeatCoinButton() {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { wallet, error } = useSelector((state: RootState) => state.wallet)
  const location = useLocation()
  const active = location.pathname === "/profile" && new URLSearchParams(location.search).get("tab") === "wallet"

  useEffect(() => {
    if (!isAuthenticated) return
    const refresh = () => { if (document.visibilityState === "visible") void dispatch(fetchWallet()) }
    refresh()
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", refresh)
    const interval = window.setInterval(refresh, 60_000)
    return () => {
      window.removeEventListener("focus", refresh)
      document.removeEventListener("visibilitychange", refresh)
      window.clearInterval(interval)
    }
  }, [dispatch, isAuthenticated, user])

  if (!isAuthenticated) return null
  const balance = wallet ? formatCoins(wallet.balance) : error ? "—" : "…"
  return (
    <div className="header-nav header-nav--beat-coin glass-transparent">
      <Link
        to="/profile?tab=wallet"
        className={`header-nav__control header-nav__beat-coin${active ? " header-nav__control--active" : ""}`}
        aria-label={`کیف پول Beat Coin، موجودی ${balance}`}
        aria-current={active ? "page" : undefined}
      >
        <Icon icon="mdi:heart-pulse" className="header-nav__beat-coin-icon" aria-hidden />
        <span className="header-nav__beat-coin-name" dir="ltr">Beat Coin</span>
        <bdi>{balance}</bdi>
      </Link>
    </div>
  )
}
