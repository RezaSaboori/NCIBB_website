import { useCallback, useState, type FormEvent } from "react"
import { Button } from "@heroui/react"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { Group } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { useAccountQuery } from "../shared/useAccountQuery"

export function GroupForm({ group, close, onSaved }: { group: Group | null; close: () => void; onSaved: () => void }) {
  const [name, setName] = useState(group?.name ?? "")
  const [parent, setParent] = useState(group?.parent ?? 0)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const candidates = useAccountQuery(useCallback(() => accountApi.groups(1, search), [search]))
  const options = candidates.data?.results.filter((candidate) => candidate.id !== group?.id) ?? []
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSaving(true)
    try {
      const data = { name, parent: parent || null }
      if (group) await accountApi.editGroup(group.id, data)
      else await accountApi.createGroup(data)
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
      <div className="account-workspace__fields">
        <label>نام گروه<input required value={name} maxLength={150} onChange={(event) => setName(event.target.value)} /></label>
        <label>جستجوی گروه بالادست<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <label>گروه بالادست<select value={parent} onChange={(event) => setParent(Number(event.target.value))}>
          <option value={0}>گروه اصلی</option>
          {parent !== 0 && !options.some((option) => option.id === parent) && <option value={parent}>گروه {parent}</option>}
          {options.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}
        </select></label>
      </div>
      <AccountStatus error={error || candidates.error} />
      <div className="account-workspace__actions"><Button type="submit" color="primary" isLoading={saving}>ذخیره گروه</Button><Button variant="flat" onPress={close}>انصراف</Button></div>
    </form>
  )
}
