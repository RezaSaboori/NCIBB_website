import { GlassCard } from "@/components/ui/GlassCard"
import { GlassTable, type GlassTableColumn } from "@/components/ui/tables/GlassTable"
import { SingleLineInput } from "@/components/ui/inputs"
import { GlassButton } from "@/components/ui/GlassButton"
import { useCallback, useState } from "react"
import { accountApi } from "@/dataset_services/accountApi"
import type { AccountGroup, Group } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { PageControls } from "../shared/PageControls"
import { useAccountQuery } from "../shared/useAccountQuery"
import { GroupDetails } from "./GroupDetails"
import { GroupForm } from "./GroupForm"

export function GroupsTab({ admin, memberships }: { admin: boolean; memberships: AccountGroup[] }) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Group>()
  const [editing, setEditing] = useState<Group | null>()
  const results = useAccountQuery(useCallback(() => admin ? accountApi.groups(page, search) : null, [admin, page, search]))
  const groups = admin ? results.data?.results : memberships.filter((membership) => membership.can_manage_wallet)
    .map(({ id, name, parent_id }) => ({ id, name, parent: parent_id }))
  const columns: GlassTableColumn<Group>[] = [
    { key: "name", label: "نام گروه", render: (group) => <strong>{group.name}</strong> },
    { key: "parent", label: "گروه بالادست", render: (group) => (
      group.parent ? groups?.find((parent) => parent.id === group.parent)?.name ?? `گروه ${group.parent}` : "—"
    ) },
    { key: "actions", label: "مدیریت", render: (group) => (
      <div className="account-workspace__actions">
        <GlassButton size="sm" onPress={() => setSelected(group)}>مدیریت</GlassButton>
        {admin && <GlassButton size="sm" onPress={() => setEditing(group)}>ویرایش</GlassButton>}
      </div>
    ) },
  ]
  return (
    <div className="account-workspace__stack">
      <section className="account-workspace__stack">
        <div className="account-workspace__toolbar">
          <h1>{admin ? "گروه‌ها" : "مدیریت گروه من"}</h1>
          {admin && <GlassButton color="primary" onPress={() => setEditing(null)}>گروه جدید</GlassButton>}
        </div>
        {editing !== undefined && <GlassCard size="sm">
          <GroupForm key={editing?.id ?? "new"} group={editing} close={() => setEditing(undefined)}
            onSaved={() => { setSelected(undefined); void results.refresh() }} />
        </GlassCard>}
        <GlassTable label="گروه‌ها" rows={groups ?? []} columns={columns} rowKey={(group) => group.id}
          controls={<>
            {admin && <label className="account-workspace__form">جستجوی گروه<SingleLineInput type="search" value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label>}
            <AccountStatus loading={results.loading} error={results.error} retry={results.refresh} />
          </>}
          footer={<PageControls data={results.data} page={page} onPage={setPage} />}
          empty={groups && <p>گروهی در دسترس نیست.</p>} />
      </section>
      {selected && <GroupDetails key={selected.id} group={selected} admin={admin} />}
    </div>
  )
}
