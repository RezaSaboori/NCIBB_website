import { useCallback, useState } from "react"
import { Button } from "@heroui/react"
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
  return (
    <section className="account-workspace__panel glass">
      <h1>کاربران</h1>
      <div className="account-workspace__form account-workspace__fields">
        <label>جستجو<input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="نام، ایمیل یا نام کاربری" /></label>
        <label>نقش<select value={role} onChange={(event) => { setRole(event.target.value); setPage(1) }}>
          <option value="">همه نقش‌ها</option>
          {roles.data?.filter((item) => item.scope === "platform").map((item) => <option key={item.id} value={item.code}>{item.label}</option>)}
        </select></label>
        <label>وضعیت<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}>
          <option value="">همه حساب‌ها</option><option value="true">فعال</option><option value="false">غیرفعال</option>
        </select></label>
      </div>
      <AccountStatus loading={users.loading} error={users.error} retry={users.refresh} />
      {users.data?.results.length === 0 && <p>کاربری یافت نشد.</p>}
      {!!users.data?.results.length && <div className="account-workspace__table-wrap">
        <table className="account-workspace__table">
          <thead><tr><th>نام و ایمیل</th><th>نقش‌ها</th><th>گروه‌ها</th><th>وضعیت</th><th>Beat Coin</th><th>جزئیات</th></tr></thead>
          <tbody>
            {users.data.results.map((user) => (
              <tr key={user.id}>
                <td><strong>{accountName(user)}</strong><br /><bdi>{user.email}</bdi></td>
                <td>{user.roles.map((item) => item.label).join("، ")}</td>
                <td>{user.groups.map((item) => item.name).join("، ") || "—"}</td>
                <td>{user.is_active ? "فعال" : "غیرفعال"}</td>
                <td>{formatCoins(user.balance)}</td>
                <td><Button size="sm" variant="flat" aria-label={`جزئیات ${accountName(user)}`} onPress={() => setUserId(user.id)}>مشاهده</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
      <PageControls data={users.data} page={page} onPage={setPage} />
      {userId && <UserDetailDialog key={userId} id={userId} viewerId={viewerId} onClose={() => setUserId(undefined)} onUpdated={() => {
        void users.refresh()
        if (viewerId === userId) onAccessChanged()
      }} />}
    </section>
  )
}
