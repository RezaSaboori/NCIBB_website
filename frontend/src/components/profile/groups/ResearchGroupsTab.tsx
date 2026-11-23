import { GlassTable, type GlassTableColumn } from "@/components/ui/tables/GlassTable"
import { Link } from "react-router-dom"
import { accountApi } from "@/dataset_services/accountApi"
import { AccountStatus } from "../shared/AccountStatus"
import { useAccountQuery } from "../shared/useAccountQuery"

type ResearchGroup = Awaited<ReturnType<typeof accountApi.researchGroups>>[number]

const columns: GlassTableColumn<ResearchGroup>[] = [
  { key: "group", label: "نام گروه", render: (group) => <strong>{group.name}</strong> },
  { key: "roles", label: "نقش‌ها", render: (group) => group.roles.map((role) => role.label).join("، ") || "—" },
  { key: "contacts", label: "افراد مرتبط", render: (group) => group.contacts.length
    ? <Link className="ui-glass-button glass" to="/profile?tab=messages">{group.contacts.map((contact) => contact.name).join("، ")}</Link>
    : "—" },
]

export function ResearchGroupsTab() {
  const groups = useAccountQuery(accountApi.researchGroups)
  return (
    <section className="account-workspace__stack">
      <h1>گروه‌های پژوهشی</h1>
      <GlassTable label="گروه‌های پژوهشی" rows={groups.data ?? []} columns={columns} rowKey={(group) => group.id}
        controls={<AccountStatus loading={groups.loading} error={groups.error} retry={groups.refresh} />}
        empty={groups.data && <p>عضو هیچ گروه پژوهشی نیستید.</p>} />
    </section>
  )
}
