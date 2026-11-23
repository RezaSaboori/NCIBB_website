import { useCallback, useState, type FormEvent } from "react"
import { Button } from "@heroui/react"
import { accountApi, accountError, type ScopedCatalog } from "@/dataset_services/accountApi"
import type { Role } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { PageControls } from "../shared/PageControls"
import { useAccountQuery } from "../shared/useAccountQuery"

function RoleForm({ role, catalog, close, onSave }: {
  role: Role | null; catalog: ScopedCatalog; close: () => void; onSave: () => void
}) {
  const [scope, setScope] = useState<Role["scope"]>(role?.scope ?? "platform")
  const [code, setCode] = useState(role?.code ?? "")
  const [label, setLabel] = useState(role?.label ?? "")
  const [capabilities, setCapabilities] = useState(role?.capabilities ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      if (role) await accountApi.editRole(role.id, { label, capabilities })
      else await accountApi.createRole({ scope, code, label, capabilities })
      onSave()
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
        <label>نام نقش<input required maxLength={100} value={label} onChange={(event) => setLabel(event.target.value)} /></label>
        <label>شناسه نقش<input required dir="ltr" maxLength={48} pattern="[a-zA-Z0-9_\-]+" disabled={!!role} value={code} onChange={(event) => setCode(event.target.value)} /></label>
        <label>دامنه<select disabled={!!role} value={scope} onChange={(event) => {
          setScope(event.target.value as Role["scope"])
          setCapabilities([])
        }}><option value="platform">سامانه</option><option value="group">گروه</option></select></label>
      </div>
      <fieldset className="account-workspace__options">
        <legend>مجوزها</legend>
        {Object.entries(catalog[scope]).map(([permission, name]) => (
          <label key={permission}><input type="checkbox" checked={capabilities.includes(permission)}
            onChange={(event) => setCapabilities(event.target.checked ? [...capabilities, permission] : capabilities.filter((item) => item !== permission))} />{name}</label>
        ))}
      </fieldset>
      <AccountStatus error={error} />
      <div className="account-workspace__actions"><Button type="submit" color="primary" isLoading={saving}>ذخیره نقش</Button><Button variant="flat" onPress={close}>انصراف</Button></div>
    </form>
  )
}

export function RolesTab() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Role | null>()
  const roles = useAccountQuery(useCallback(() => accountApi.roles(page), [page]))
  const catalog = useAccountQuery(accountApi.roleCatalog)

  return (
    <section className="account-workspace__panel glass">
      <div className="account-workspace__toolbar"><h1>نقش‌ها و مجوزها</h1><Button color="primary" onPress={() => setEditing(null)}>نقش جدید</Button></div>
      <AccountStatus loading={roles.loading || catalog.loading} error={roles.error || catalog.error} retry={() => { void roles.refresh(); void catalog.refresh() }} />
      {editing !== undefined && catalog.data && <RoleForm key={editing?.id ?? "new"} role={editing} catalog={catalog.data}
        close={() => setEditing(undefined)} onSave={() => void roles.refresh()} />}
      <ul className="account-workspace__rows">
        {roles.data?.results.map((role) => <li key={role.id}>
          <span><strong>{role.label}</strong> · {role.scope === "platform" ? "سامانه" : "گروه"}
            {role.capabilities.length > 0 && <small>{role.capabilities.map((key) => catalog.data?.[role.scope][key] ?? key).join("، ")}</small>}</span>
          {role.builtin ? <span>پیش‌فرض</span> : <Button size="sm" variant="flat" onPress={() => setEditing(role)}>ویرایش</Button>}
        </li>)}
      </ul>
      <PageControls data={roles.data} page={page} onPage={setPage} />
    </section>
  )
}
