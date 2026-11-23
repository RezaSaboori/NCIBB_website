import { SingleLineInput, SelectInput } from "@/components/ui/inputs"
import { GlassButton } from "@/components/ui/GlassButton"
import { useCallback, useState } from "react"
import { GlassTable, type GlassTableColumn } from "@/components/ui/tables/GlassTable"
import type { DirectoryUser } from "@/types/account"
import { accountApi } from "@/dataset_services/accountApi"
import { accountName, formatCoins } from "../shared/accountFormat"
import { AccountStatus } from "../shared/AccountStatus"
import { PageControls } from "../shared/PageControls"
import { useAccountQuery } from "../shared/useAccountQuery"
import { UserDetailDialog } from "./UserDetailDialog"

export function UsersTab({ viewerId, initialStatus = "", onAccessChanged }: {
  viewerId: number; initialStatus?: string; onAccessChanged: () => void
}) {
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState(initialStatus)
  const [page, setPage] = useState(1)
  const [userId, setUserId] = useState<number>()
  const users = useAccountQuery(useCallback(() => accountApi.users(page, search, role, status), [page, search, role, status]))
  const roles = useAccountQuery(accountApi.allRoles)
  const columns: GlassTableColumn<DirectoryUser>[] = [
    { key: "identity", label: "نام و ایمیل", render: (user) => <><strong>{accountName(user)}</strong><br /><bdi>{user.email}</bdi></> },
    { key: "roles", label: "نقش‌ها", render: (user) => user.roles.map((item) => item.label).join("، ") },
    { key: "groups", label: "گروه‌ها", render: (user) => user.groups.map((item) => item.name).join("، ") || "—" },
    { key: "status", label: "وضعیت", render: (user) => user.is_active ? "فعال" : "غیرفعال" },
    { key: "credit", label: "Beat Coin", render: (user) => formatCoins(user.balance) },
    { key: "action", label: "جزئیات", render: (user) => (
      <GlassButton size="sm" aria-label={`جزئیات ${accountName(user)}`} onPress={() => setUserId(user.id)}>مشاهده</GlassButton>
    ) },
  ]
  return (
    <div className="account-workspace__stack">
      <h1>کاربران</h1>
      <GlassTable label="کاربران" rows={users.data?.results ?? []} columns={columns} rowKey={(user) => user.id}
        controls={<>
          <div className="account-workspace__form account-workspace__fields">
            <label>جستجو<SingleLineInput type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="نام، ایمیل یا نام کاربری" /></label>
            <label>نقش<SelectInput value={role} onChange={(value) => { setRole(value); setPage(1) }} options={[
              { value: "", label: "همه نقش‌ها" },
              ...(roles.data ?? []).filter((item) => item.scope === "platform").map((item) => ({ value: item.code, label: item.label })),
            ]} /></label>
            <label>وضعیت<SelectInput value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={[
              { value: "", label: "همه حساب‌ها" }, { value: "true", label: "فعال" }, { value: "false", label: "غیرفعال" },
            ]} /></label>
          </div>
          <AccountStatus loading={users.loading} error={users.error} retry={users.refresh} />
        </>}
        footer={<PageControls data={users.data} page={page} onPage={setPage} />}
        empty={users.data && <p>کاربری یافت نشد.</p>}
      />
      {userId && <UserDetailDialog key={userId} id={userId} viewerId={viewerId} onClose={() => setUserId(undefined)} onUpdated={() => {
        void users.refresh()
        if (viewerId === userId) onAccessChanged()
      }} />}
    </div>
  )
}
