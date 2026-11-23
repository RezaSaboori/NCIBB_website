import { GlassCard } from "@/components/ui/GlassCard"
import { GlassTabs } from "@/components/ui/GlassTabs"
import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Tab } from "@heroui/react"
import { useDispatch } from "react-redux"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { AppDispatch } from "@/store/store"
import { fetchWallet } from "@/store/walletSlice"
import { accountName, formatCoins } from "../shared/accountFormat"
import { AccountStatus } from "../shared/AccountStatus"
import { useAccountQuery } from "../shared/useAccountQuery"
import { AdjustmentForm } from "../wallet/AdjustmentForm"
import { ProfileModal } from "../shared/ProfileModal"
import { UserAccountSection } from "./UserAccountSection"
import { UserAuditSection, UserLedgerSection, UserMessagesSection, UserProjectsSection } from "./UserDetailSections"

export function UserDetailDialog({ id, viewerId, onClose, onUpdated }: {
  id: number
  viewerId: number
  onClose: () => void
  onUpdated: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const detail = useAccountQuery(useCallback(() => accountApi.user(id), [id]))
  const roles = useAccountQuery(accountApi.allRoles)
  const [roleIds, setRoleIds] = useState<number[]>([])
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")
  const [ledgerRevision, setLedgerRevision] = useState(0)
  const [section, setSection] = useState("account")
  const user = detail.data

  useEffect(() => {
    if (!user) return
    setActive(user.is_active)
    setRoleIds(user.roles.flatMap((role) => role.id ? [role.id] : []))
  }, [user])

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    setStatus("")
    try {
      await accountApi.changeAccess(id, { roles: roleIds, is_active: active })
      setStatus("دسترسی حساب به‌روزرسانی شد.")
      void detail.refresh()
      onUpdated()
      if (viewerId === id) void dispatch(fetchWallet())
    } catch (error) {
      setError(accountError(error))
    } finally {
      setSaving(false)
    }
  }
  return (
    <ProfileModal isOpen size="4xl" animateSize title={user ? accountName(user) : "جزئیات کاربر"} onClose={onClose}>
      <AccountStatus loading={detail.loading} error={detail.error} retry={detail.refresh} />
      {user && (
        <GlassTabs aria-label="جزئیات کاربر" selectedKey={section} onSelectionChange={(key) => setSection(String(key))}>
          <Tab key="account" title="حساب">
            <UserAccountSection user={user} roles={roles.data?.filter((role) => role.scope === "platform" && role.code !== "user")}
              active={active} selectedRoles={roleIds} saving={saving} onActiveChange={setActive}
              onRolesChange={setRoleIds} onSave={save}
              accessFeedback={<AccountStatus loading={roles.loading} error={roles.error} retry={roles.refresh} />}
              saveFeedback={<>
                {status && <p role="status">{status}</p>}
                {error && <p className="account-workspace__error" role="alert">{error}</p>}
              </>} />
          </Tab>
          <Tab key="projects" title="پروژه‌ها"><UserProjectsSection id={id} /></Tab>
          <Tab key="messages" title="پیام‌ها"><GlassCard size="sm"><UserMessagesSection id={id} /></GlassCard></Tab>
          <Tab key="wallet" title="اعتبار">
            <div className="account-workspace__stack">
              <GlassCard size="sm"><p>موجودی {formatCoins(user.wallet.balance)} Beat Coin · ماهانه {formatCoins(user.wallet.monthly_balance)} · دائمی {formatCoins(user.wallet.permanent_balance)}</p>
              <AdjustmentForm save={(data) => accountApi.adjustUser(id, data)} onSaved={() => {
                setLedgerRevision((value) => value + 1)
                void detail.refresh()
                onUpdated()
                if (viewerId === id) void dispatch(fetchWallet())
              }} /></GlassCard>
              <UserLedgerSection id={id} revision={ledgerRevision} />
            </div>
          </Tab>
          <Tab key="audit" title="رویدادها"><UserAuditSection id={id} /></Tab>
        </GlassTabs>
      )}
    </ProfileModal>
  )
}
