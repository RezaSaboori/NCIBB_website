import { SingleLineInput, SelectInput } from "@/components/ui/inputs"
import { GlassButton } from "@/components/ui/GlassButton"
import { useCallback, useState, type FormEvent } from "react"
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
        <label>نام گروه<SingleLineInput required value={name} maxLength={150} onChange={(event) => setName(event.target.value)} /></label>
        <label>جستجوی گروه بالادست<SingleLineInput type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <label>گروه بالادست<SelectInput value={parent} onChange={(value) => setParent(Number(value))} options={[
          { value: "0", label: "گروه اصلی" },
          ...(parent && !options.some((option) => option.id === parent) ? [{ value: String(parent), label: `گروه ${parent}` }] : []),
          ...options.map((option) => ({ value: String(option.id), label: option.name })),
        ]} /></label>
      </div>
      <AccountStatus error={error || candidates.error} />
      <div className="account-workspace__actions"><GlassButton type="submit" color="primary" isLoading={saving}>ذخیره گروه</GlassButton><GlassButton variant="flat" onPress={close}>انصراف</GlassButton></div>
    </form>
  )
}
