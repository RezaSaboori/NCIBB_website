import { useState } from "react"
import { GlassButton } from "@/components/ui/GlassButton"
import { GlassCard } from "@/components/ui/GlassCard"
import { Link, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { accountApi } from "@/dataset_services/accountApi"
import type { AppDispatch, RootState } from "@/store/store"
import { fetchWallet } from "@/store/walletSlice"
import "../../components/profile/accountWorkspace.css"

export default function VerifyEmailPage() {
  const location = useLocation()
  const [token] = useState(() => new URLSearchParams(location.hash.slice(1)).get("token"))
  const [state, setState] = useState<"idle" | "checking" | "verified" | "error">("idle")
  const dispatch = useDispatch<AppDispatch>()
  const authenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  const verify = async () => {
    if (!token) return
    setState("checking")
    try {
      await accountApi.verifyEmail(token)
      window.history.replaceState(window.history.state, "", location.pathname)
      setState("verified")
      if (authenticated) void dispatch(fetchWallet())
    } catch {
      setState("error")
    }
  }

  return (
    <div className="page-content page-content--narrow account-workspace account-workspace__stack" dir="rtl">
      <h1>تأیید ایمیل</h1>
      <GlassCard size="md" footer={state === "verified" ? (
        <Link className="glass ui-glass-button" to="/profile">بازگشت به پروفایل</Link>
      ) : token && <GlassButton color="primary" isLoading={state === "checking"} onPress={() => void verify()}>تأیید ایمیل</GlassButton>}>
        {!token && <p role="alert">پیوند تأیید معتبر نیست.</p>}
        {state === "error" && <p role="alert">تأیید انجام نشد. پیوند را بررسی کنید یا پیوند تازه‌ای درخواست دهید.</p>}
        {state === "verified" && <p role="status">ایمیل شما تأیید شد.</p>}
      </GlassCard>
    </div>
  )
}
