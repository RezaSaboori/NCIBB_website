import { Link } from "react-router-dom"
import { accountApi } from "@/dataset_services/accountApi"
import { AccountStatus } from "../shared/AccountStatus"
import { useAccountQuery } from "../shared/useAccountQuery"

export function ResearchGroupsTab() {
  const groups = useAccountQuery(accountApi.researchGroups)
  return (
    <section className="account-workspace__panel glass">
      <h1>گروه‌های پژوهشی</h1>
      <AccountStatus loading={groups.loading} error={groups.error} retry={groups.refresh} />
      {groups.data?.length === 0 && <p>عضو هیچ گروه پژوهشی نیستید.</p>}
      <ul className="account-workspace__rows">
        {groups.data?.map((group) => (
          <li key={group.id}>
            <div><strong>{group.name}</strong><small>{group.roles.map((role) => role.label).join("، ")}</small></div>
            {group.contacts.length > 0 && <Link to="/profile?tab=messages">{group.contacts.map((contact) => contact.name).join("، ")}</Link>}
          </li>
        ))}
      </ul>
    </section>
  )
}
