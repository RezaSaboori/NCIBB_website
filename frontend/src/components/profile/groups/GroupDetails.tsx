import { GlassCard } from "@/components/ui/GlassCard"
import { GlassTable, type GlassTableColumn } from "@/components/ui/tables/GlassTable"
import { GlassTabs } from "@/components/ui/GlassTabs"
import { SearchInput } from "@/components/ui/inputs"
import { GlassButton } from "@/components/ui/GlassButton"
import { useCallback, useState } from "react"
import { Tab } from "@heroui/react"
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
      {wallet.data && <GlassCard size="sm" heading={<h3>موجودی اشتراکی</h3>}>
        <strong className="account-workspace__balance">{formatCoins(wallet.data.balance)} <bdi>Beat Coin</bdi></strong>
      </GlassCard>}
      {admin && <GlassCard size="sm" heading={<h3>تنظیم موجودی گروه</h3>}>
        <AdjustmentForm shared save={(data) => accountApi.adjustGroup(group.id, data)} onSaved={() => {
          if (page === 1) void wallet.refresh()
          else setPage(1)
        }} />
      </GlassCard>}
      <CreditLedger entries={wallet.data?.results ?? []}
        controls={<AccountStatus loading={wallet.loading} error={wallet.error} retry={wallet.refresh} />}
        footer={<PageControls data={wallet.data} page={page} onPage={setPage} />}
        showEmpty={!!wallet.data} />
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
  const columns: GlassTableColumn<GroupMember>[] = [
    { key: "name", label: "عضو", render: (member) => <strong><bdi>{member.user_name || member.username}</bdi></strong> },
    { key: "roles", label: "نقش‌ها", render: (member) => member.roles.map((role) => role.label).join("، ") || "عضو" },
    { key: "status", label: "وضعیت", render: (member) => member.active ? "فعال" : "غیرفعال" },
    { key: "actions", label: "مدیریت", render: (member) => (
      <div className="account-workspace__actions">
        <GlassButton size="sm" isLoading={busy === member.id} isDisabled={!member.active || busy !== undefined}
          onPress={() => void toggleSpend(member)}>{member.can_spend ? "لغو اجازه برداشت" : "اجازه برداشت"}</GlassButton>
        {admin && <GlassButton size="sm" onPress={() => setEditedMember(member)}>ویرایش عضویت</GlassButton>}
      </div>
    ) },
  ]
  return (
    <section className="account-workspace__section">
      <h2>{group.name}</h2>
      <GlassTabs aria-label="مدیریت گروه" selectedKey={section} onSelectionChange={(key) => setSection(String(key))}>
        <Tab title="اعضا" key="members">
          <GlassTable label="اعضای گروه" rows={members.data?.results ?? []} columns={columns} rowKey={(member) => member.id}
            controls={<div className="account-workspace__section">
              <div className="account-workspace__toolbar">
                <label className="account-workspace__form">جستجوی اعضا<SearchInput className="ui-input-shell--persian" inputProps={{ type: "search" }} value={search} onChange={(value) => {
                  setSearch(value)
                  setPage(1)
                }} /></label>
                {admin && <GlassButton color="primary" isDisabled={!roles.data} onPress={() => setEditedMember(null)}>افزودن عضو</GlassButton>}
              </div>
              <AccountStatus loading={members.loading || roles.loading} error={error || members.error || roles.error}
                retry={() => { void members.refresh(); if (admin) void roles.refresh() }} />
              {editedMember !== undefined && roles.data && (
                <GroupMemberForm key={editedMember?.id ?? "new"} group={group.id} member={editedMember}
                  roles={roles.data.filter((role) => role.scope === "group")}
                  close={() => setEditedMember(undefined)} onSaved={() => void members.refresh()} />
              )}
            </div>}
            footer={<PageControls data={members.data} page={page} onPage={setPage} />}
            empty={members.data && <p>عضوی یافت نشد.</p>} />
        </Tab>
        <Tab title="اعتبار اشتراکی" key="wallet"><GroupWalletPanel group={group} admin={admin} /></Tab>
        {admin && <Tab title="استاد و دانشجو" key="mentors">
          <GroupMentorsPanel group={group.id} names={Object.fromEntries((members.data?.results ?? []).map(
            (member) => [member.id, member.user_name || member.username],
          ))} />
        </Tab>}
      </GlassTabs>
    </section>
  )
}
