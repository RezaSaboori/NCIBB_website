import { useCallback, useState } from "react"
import { Button, Tab, Tabs } from "@heroui/react"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { Group, GroupMember } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { PageControls } from "../shared/PageControls"
import { formatCoins } from "../shared/accountFormat"
import { useAccountQuery } from "../shared/useAccountQuery"
import { AdjustmentForm } from "../wallet/AdjustmentForm"
import { CreditLedger } from "../wallet/CreditLedger"
import { GroupMemberForm } from "./GroupMemberForm"
import { GroupMentorsPanel } from "./GroupMentorsPanel"

function GroupWalletPanel({ group, admin }: { group: Group; admin: boolean }) {
  const [page, setPage] = useState(1)
  const wallet = useAccountQuery(useCallback(() => accountApi.groupWallet(group.id, page), [group.id, page]))
  return (
    <div className="account-workspace__stack">
      <h3>کیف پول اشتراکی</h3>
      <AccountStatus loading={wallet.loading} error={wallet.error} retry={wallet.refresh} />
      {wallet.data && <p>موجودی {formatCoins(wallet.data.balance)} Beat Coin</p>}
      {admin && <AdjustmentForm shared save={(data) => accountApi.adjustGroup(group.id, data)} onSaved={() => {
        if (page === 1) void wallet.refresh()
        else setPage(1)
      }} />}
      {wallet.data && <CreditLedger entries={wallet.data.results} />}
      <PageControls data={wallet.data} page={page} onPage={setPage} />
    </div>
  )
}

export function GroupDetails({ group, admin }: { group: Group; admin: boolean }) {
  const [page, setPage] = useState(1)
  const [section, setSection] = useState("members")
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState<number>()
  const [editedMember, setEditedMember] = useState<GroupMember | null>()
  const members = useAccountQuery(useCallback(() => accountApi.groupMembers(group.id, page, search), [group.id, page, search]))
  const roles = useAccountQuery(useCallback(() => admin ? accountApi.allRoles() : null, [admin]))
  const toggleSpend = async (member: GroupMember) => {
    setError("")
    setBusy(member.id)
    try {
      await accountApi.changeSpending(group.id, member.id, !member.can_spend)
      void members.refresh()
    } catch (error) {
      setError(accountError(error))
    } finally {
      setBusy(undefined)
    }
  }
  return (
    <section className="account-workspace__panel glass">
      <h2>{group.name}</h2>
      <Tabs aria-label="مدیریت گروه" selectedKey={section} onSelectionChange={(key) => setSection(String(key))}>
        <Tab title="اعضا" key="members">
          <div className="account-workspace__stack">
            <div className="account-workspace__toolbar">
              <label className="account-workspace__form">جستجوی اعضا<input value={search} type="search" onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }} /></label>
              {admin && <Button color="primary" isDisabled={!roles.data} onPress={() => setEditedMember(null)}>افزودن عضو</Button>}
            </div>
            <AccountStatus loading={members.loading || roles.loading} error={error || members.error || roles.error}
              retry={() => { void members.refresh(); if (admin) void roles.refresh() }} />
            {editedMember !== undefined && roles.data && (
              <GroupMemberForm key={editedMember?.id ?? "new"} group={group.id} member={editedMember}
                roles={roles.data.filter((role) => role.scope === "group")}
                close={() => setEditedMember(undefined)} onSaved={() => void members.refresh()} />
            )}
            {members.data?.results.length === 0 && <p>عضوی یافت نشد.</p>}
            <ul className="account-workspace__rows">
              {members.data?.results.map((member) => (
                <li key={member.id}>
                  <div><strong>{member.user_name || member.username}</strong>
                    <small>{member.active ? "فعال" : "غیرفعال"} · {member.roles.map((role) => role.label).join("، ") || "عضو"}</small>
                  </div>
                  <div className="account-workspace__actions">
                    <Button size="sm" variant="flat" isLoading={busy === member.id} isDisabled={!member.active || busy !== undefined}
                      onPress={() => void toggleSpend(member)}>{member.can_spend ? "لغو اجازه برداشت" : "اجازه برداشت"}</Button>
                    {admin && <Button size="sm" variant="flat" onPress={() => setEditedMember(member)}>ویرایش عضویت</Button>}
                  </div>
                </li>
              ))}
            </ul>
            <PageControls data={members.data} page={page} onPage={setPage} />
          </div>
        </Tab>
        <Tab title="اعتبار اشتراکی" key="wallet"><GroupWalletPanel group={group} admin={admin} /></Tab>
        {admin && <Tab title="استاد و دانشجو" key="mentors">
          <GroupMentorsPanel group={group.id} names={Object.fromEntries((members.data?.results ?? []).map(
            (member) => [member.id, member.user_name || member.username],
          ))} />
        </Tab>}
      </Tabs>
    </section>
  )
}
