import { GlassCard } from "@/components/ui/GlassCard"
import { GlassTabs } from "@/components/ui/GlassTabs"
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { Tab } from "@heroui/react"
import { useDispatch } from "react-redux"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { AppDispatch } from "@/store/store"
import { fetchWallet } from "@/store/walletSlice"
import type { Role } from "@/types/account"
import { accountName } from "../shared/accountFormat"
import { AccountStatus } from "../shared/AccountStatus"
import { useAccountQuery } from "../shared/useAccountQuery"
import { AdjustmentForm } from "../wallet/AdjustmentForm"
import { WalletBalanceCards } from "../wallet/WalletBalanceCards"
import { ProfileModal } from "../shared/ProfileModal"
import { UserAccountSection } from "./UserAccountSection"
import { UserAuditSection, UserLedgerSection, UserMessagesSection, UserProjectsSection } from "./UserDetailSections"

export function UserDetailDialog({ id, initialTitle, roles, viewerId, isOpen, onClose, onUpdated }: {
  id: number
  initialTitle: string
  roles: Pick<ReturnType<typeof useAccountQuery<Role[]>>, "data" | "loading" | "error" | "refresh">
  viewerId: number
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const detail = useAccountQuery(useCallback(() => accountApi.user(id), [id]))
  const [roleIds, setRoleIds] = useState<number[]>([])
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")
  const [ledgerRevision, setLedgerRevision] = useState(0)
  const [tabRail, setTabRail] = useState<HTMLDivElement | null>(null)
  const [selectedTab, setSelectedTab] = useState("account")
  const user = detail.data
  const detailsShown = useRef(false)
  const preparing = (!user && detail.loading) || (!!user && roles.loading && !detailsShown.current)

  useEffect(() => {
    if (!user) return
    setActive(user.is_active)
    setRoleIds(user.roles.flatMap((role) => role.id ? [role.id] : []))
  }, [user])

  useEffect(() => {
    if (user && !preparing) detailsShown.current = true
  }, [preparing, user])

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
    <ProfileModal isOpen={isOpen} size="4xl" animateSize bodyKey={selectedTab} title={user ? accountName(user) : initialTitle}
      contentPending={preparing} estimatedBodySize="min(32rem, 57dvh)" headerNavigationRef={setTabRail} onClose={onClose}>
      <AccountStatus loading={preparing} error={detail.error} retry={detail.refresh} />
      {user && tabRail && !preparing && (
        <GlassTabs aria-label="جزئیات کاربر" railTarget={tabRail} animatePanel
          selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(String(key))}>
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
              <WalletBalanceCards wallet={user.wallet} />
              <GlassCard size="sm" heading={<h3>تنظیم موجودی حساب</h3>}>
                <AdjustmentForm save={(data) => accountApi.adjustUser(id, data)} onSaved={() => {
                  setLedgerRevision((value) => value + 1)
                  void detail.refresh()
                  onUpdated()
                  if (viewerId === id) void dispatch(fetchWallet())
                }} />
              </GlassCard>
              <UserLedgerSection id={id} revision={ledgerRevision} />
            </div>
          </Tab>
          <Tab key="audit" title="رویدادها"><UserAuditSection id={id} /></Tab>
        </GlassTabs>
      )}
    </ProfileModal>
  )
}
