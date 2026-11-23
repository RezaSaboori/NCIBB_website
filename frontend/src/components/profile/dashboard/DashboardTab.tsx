import { useCallback } from "react"
import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"

import { accountApi } from "@/dataset_services/accountApi"
import type { RootState } from "@/store/store"
import type { AccountProfile } from "@/types/account"
import { fetchAllUserProjects } from "../projects/profileProjectsApi"
import { accountName, formatCoins } from "../shared/accountFormat"
import { AccountStatus } from "../shared/AccountStatus"
import { useAccountQuery } from "../shared/useAccountQuery"

export default function DashboardTab({ profile }: { profile: AccountProfile }) {
  const isAdmin = profile.capabilities.includes("platform.admin")
  const isSupport = profile.capabilities.includes("messaging.support_queue")
  const { wallet } = useSelector((state: RootState) => state.wallet)
  const messages = useAccountQuery(accountApi.messageCounts)
  const projects = useAccountQuery(fetchAllUserProjects)
  const platform = useAccountQuery(useCallback(() => isAdmin ? accountApi.platformCounts() : null, [isAdmin]))
  const queue = useAccountQuery(useCallback(() => isSupport ? accountApi.threads(1, "support_queue") : null, [isSupport]))

  return (
    <div className="account-workspace__stack">
      <section className="account-workspace__panel glass">
        <h1>داشبورد</h1>
        <p className="account-workspace__muted">{accountName(profile)} · {profile.roles.map((role) => role.label).join("، ")}</p>
        <div className="account-workspace__metrics">
          <Link to="/profile?tab=wallet"><Icon icon="mdi:heart-pulse" /><span>Beat Coin</span><strong>{wallet ? formatCoins(wallet.balance) : "—"}</strong></Link>
          <Link to="/profile?tab=messages"><Icon icon="tabler:message-circle" /><span>پیام‌های خوانده‌نشده</span><strong>{messages.data ? formatCoins(messages.data.unread_count) : "—"}</strong></Link>
          <Link to="/profile?tab=projects"><Icon icon="solar:folder-linear" /><span>پروژه‌های من</span><strong>{projects.data ? formatCoins(projects.data.length) : "—"}</strong></Link>
        </div>
      </section>
      {isSupport && (
        <section className="account-workspace__panel glass">
          <h2>صف پشتیبانی</h2>
          <AccountStatus loading={queue.loading} error={queue.error} retry={queue.refresh} />
          {queue.data && <Link to="/profile?tab=support">{formatCoins(queue.data.count)} گفتگو در صف پشتیبانی</Link>}
        </section>
      )}
      {isAdmin && (
        <section className="account-workspace__panel glass">
          <h2>مدیریت سامانه</h2>
          <AccountStatus loading={platform.loading} error={platform.error} retry={platform.refresh} />
          {platform.data && <div className="account-workspace__metrics">
            <Link to="/profile?tab=users"><span>کاربران</span><strong>{formatCoins(platform.data.total_users)}</strong></Link>
            <Link to="/profile?tab=users&status=true"><span>کاربران فعال</span><strong>{formatCoins(platform.data.active_users)}</strong></Link>
            <div><span>پروژه‌های سامانه</span><strong>{formatCoins(platform.data.total_projects)}</strong></div>
          </div>}
        </section>
      )}
    </div>
  )
}
