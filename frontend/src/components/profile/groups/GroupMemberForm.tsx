import { useCallback, useState, type FormEvent } from "react"
import { Button } from "@heroui/react"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { GroupMember, Role } from "@/types/account"
import { RoleChoices } from "../admin/RoleChoices"
import { AccountStatus } from "../shared/AccountStatus"
import { accountName } from "../shared/accountFormat"
import { useAccountQuery } from "../shared/useAccountQuery"

export function GroupMemberForm({ group, member, roles, close, onSaved }: {
  group: number; member: GroupMember | null; roles: Role[]; close: () => void; onSaved: () => void
}) {
  const [search, setSearch] = useState("")
  const [user, setUser] = useState(member?.user ?? 0)
  const [rolesSelected, setRolesSelected] = useState(member?.roles.map((role) => role.id) ?? [])
  const [active, setActive] = useState(member?.active ?? true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const users = useAccountQuery(useCallback(() => !member && search.trim() ? accountApi.users(1, search) : null, [member, search]))
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return
    setError("")
    setSaving(true)
    try {
      await accountApi.changeMembership(group, user, { roles: rolesSelected, active })
      onSaved()
      close()
    } catch (error) {
      setError(accountError(error))
    } finally {
      setSaving(false)
    }
  }
  return (
    <form className="account-workspace__form" onSubmit={submit}>
      {member ? <h3>{member.user_name || member.username}</h3> : (
        <div className="account-workspace__fields">
          <label>جستجوی کاربر<input value={search} onChange={(event) => { setSearch(event.target.value); setUser(0) }} placeholder="نام یا ایمیل" /></label>
          <AccountStatus loading={users.loading && !!search} error={users.error} retry={users.refresh} />
          <label>کاربر<select required value={user || ""} onChange={(event) => setUser(Number(event.target.value))}>
            <option value="">انتخاب کاربر</option>
            {users.data?.results.map((account) => <option value={account.id} key={account.id}>{accountName(account)} · {account.email}</option>)}
          </select></label>
        </div>
      )}
      <RoleChoices label="نقش‌های گروه" roles={roles} selected={rolesSelected} onChange={setRolesSelected} />
      <label className="account-workspace__check"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />عضویت فعال</label>
      <AccountStatus error={error} />
      <div className="account-workspace__actions">
        <Button color="primary" type="submit" isLoading={saving} isDisabled={!user}>ذخیره عضویت</Button>
        <Button variant="flat" onPress={close}>انصراف</Button>
      </div>
    </form>
  )
}
