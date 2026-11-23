import { GlassCard } from "@/components/ui/GlassCard"
import { GlassTable, type GlassTableColumn } from "@/components/ui/tables/GlassTable"
import { SingleLineInput, SelectInput } from "@/components/ui/inputs"
import { GlassButton } from "@/components/ui/GlassButton"
import { useCallback, useState, type FormEvent } from "react"
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
        <label>نام نقش<SingleLineInput required maxLength={100} value={label} onChange={(event) => setLabel(event.target.value)} /></label>
        <label>شناسه نقش<SingleLineInput required dir="ltr" maxLength={48} pattern="[a-zA-Z0-9_\-]+" disabled={!!role} value={code} onChange={(event) => setCode(event.target.value)} /></label>
        <label>دامنه<SelectInput disabled={!!role} value={scope} onChange={(value) => {
          setScope(value as Role["scope"])
          setCapabilities([])
        }} options={[{ value: "platform", label: "سامانه" }, { value: "group", label: "گروه" }]} /></label>
      </div>
      <fieldset className="account-workspace__options">
        <legend>مجوزها</legend>
        {Object.entries(catalog[scope]).map(([permission, name]) => (
          <label key={permission}><input type="checkbox" checked={capabilities.includes(permission)}
            onChange={(event) => setCapabilities(event.target.checked ? [...capabilities, permission] : capabilities.filter((item) => item !== permission))} />{name}</label>
        ))}
      </fieldset>
      <AccountStatus error={error} />
      <div className="account-workspace__actions"><GlassButton type="submit" color="primary" isLoading={saving}>ذخیره نقش</GlassButton><GlassButton variant="flat" onPress={close}>انصراف</GlassButton></div>
    </form>
  )
}

export function RolesTab() {
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Role | null>()
  const roles = useAccountQuery(useCallback(() => accountApi.roles(page), [page]))
  const catalog = useAccountQuery(accountApi.roleCatalog)

  const columns: GlassTableColumn<Role>[] = [
    { key: "role", label: "نام نقش", render: (role) => <strong>{role.label}</strong> },
    { key: "scope", label: "دامنه", render: (role) => role.scope === "platform" ? "سامانه" : "گروه" },
    { key: "capabilities", label: "مجوزها", render: (role) => (
      role.capabilities.map((key) => catalog.data?.[role.scope][key] ?? key).join("، ") || "—"
    ) },
    { key: "actions", label: "مدیریت", render: (role) => role.builtin
      ? "پیش‌فرض"
      : <GlassButton size="sm" aria-label={`ویرایش ${role.label}`} onPress={() => setEditing(role)}>ویرایش</GlassButton> },
  ]

  return (
    <section className="account-workspace__stack">
      <div className="account-workspace__toolbar"><h1>نقش‌ها و مجوزها</h1><GlassButton color="primary" onPress={() => setEditing(null)}>نقش جدید</GlassButton></div>
      {editing !== undefined && catalog.data && <GlassCard size="md">
        <RoleForm key={editing?.id ?? "new"} role={editing} catalog={catalog.data}
          close={() => setEditing(undefined)} onSave={() => void roles.refresh()} />
      </GlassCard>}
      <GlassTable label="نقش‌ها و مجوزها" rows={roles.data?.results ?? []} columns={columns} rowKey={(role) => role.id}
        controls={<AccountStatus loading={roles.loading || catalog.loading} error={roles.error || catalog.error}
          retry={() => { void roles.refresh(); void catalog.refresh() }} />}
        footer={<PageControls data={roles.data} page={page} onPage={setPage} />}
        empty={roles.data && <p>نقشی یافت نشد.</p>} />
    </section>
  )
}
