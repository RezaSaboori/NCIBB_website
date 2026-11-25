import { coinIcon } from "@/components/ui/coinIcon"
import { useCallback } from "react"
import { useSelector } from "react-redux"
import { accountApi } from "@/dataset_services/accountApi"
import type { RootState } from "@/store/store"
import type { AccountProfile } from "@/types/account"
import { fetchAllUserProjects } from "../projects/profileProjectsApi"
import { accountName } from "../shared/accountFormat"
import { AccountStatus } from "../shared/AccountStatus"
import { useAccountQuery } from "../shared/useAccountQuery"
import { DashboardMetric } from "./DashboardMetric"

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
      <div className="account-workspace__page-heading">
        <h1>داشبورد</h1>
        <p className="account-workspace__muted">{accountName(profile)} · {profile.roles.map((role) => role.label).join("، ")}</p>
      </div>
      <div className="account-workspace__metrics">
        <DashboardMetric label="موجودی Beat Coin" icon={coinIcon} value={wallet?.balance}
          action={{ to: "/profile?tab=wallet", label: "کیف پول", primary: true }} />
        <DashboardMetric label="پیام‌های خوانده‌نشده" icon="tabler:message-circle" value={messages.data?.unread_count}
          action={{ to: "/profile?tab=messages", label: "پیام‌ها" }} />
        <DashboardMetric label="پروژه‌های من" icon="tabler:folder" value={projects.data?.length}
          action={{ to: "/profile?tab=projects", label: "مشاهده پروژه‌ها" }} />
        {isSupport && <DashboardMetric label="تیکت‌های پشتیبانی" icon="tabler:headset" value={queue.data?.count}
          action={{ to: "/profile?tab=support", label: "صف پشتیبانی" }} />}
      </div>
      {isSupport && queue.error && <AccountStatus error={queue.error} retry={queue.refresh} />}
      {isAdmin && (
        <section className="account-workspace__section">
          <h2>مدیریت سامانه</h2>
          <AccountStatus loading={platform.loading} error={platform.error} retry={platform.refresh} />
          {platform.data && <div className="account-workspace__metrics">
            <DashboardMetric label="کاربران" icon="tabler:users" value={platform.data.total_users}
              action={{ to: "/profile?tab=users", label: "مشاهده کاربران" }} />
            <DashboardMetric label="کاربران فعال" icon="tabler:user-check" value={platform.data.active_users}
              action={{ to: "/profile?tab=users&status=true", label: "مشاهده حساب‌های فعال" }} />
            <DashboardMetric label="پروژه‌های سامانه" icon="tabler:folders" value={platform.data.total_projects} />
          </div>}
        </section>
      )}
    </div>
  )
}
