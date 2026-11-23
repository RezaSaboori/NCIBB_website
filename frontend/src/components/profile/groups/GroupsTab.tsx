import { useCallback, useState } from "react"
import { Button } from "@heroui/react"
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
  return (
    <div className="account-workspace__stack">
      <section className="account-workspace__panel glass">
        <div className="account-workspace__toolbar">
          <h1>{admin ? "گروه‌ها" : "مدیریت گروه من"}</h1>
          {admin && <Button color="primary" onPress={() => setEditing(null)}>گروه جدید</Button>}
        </div>
        {admin && <label className="account-workspace__form">جستجوی گروه<input type="search" value={search}
          onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label>}
        <AccountStatus loading={results.loading} error={results.error} retry={results.refresh} />
        {editing !== undefined && <GroupForm key={editing?.id ?? "new"} group={editing} close={() => setEditing(undefined)}
          onSaved={() => { setSelected(undefined); void results.refresh() }} />}
        {groups?.length === 0 && <p>گروهی در دسترس نیست.</p>}
        <ul className="account-workspace__rows">
          {groups?.map((group) => (
            <li key={group.id}>
              <div><strong>{group.name}</strong>
                {group.parent && <small>{groups.find((parent) => parent.id === group.parent)?.name ?? `گروه بالادست ${group.parent}`}</small>}
              </div>
              <div className="account-workspace__actions">
                <Button size="sm" variant="flat" onPress={() => setSelected(group)}>مدیریت</Button>
                {admin && <Button size="sm" variant="flat" onPress={() => setEditing(group)}>ویرایش</Button>}
              </div>
            </li>
          ))}
        </ul>
        <PageControls data={results.data} page={page} onPage={setPage} />
      </section>
      {selected && <GroupDetails key={selected.id} group={selected} admin={admin} />}
    </div>
  )
}
