import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Button, Modal, ModalBody, ModalContent, ModalHeader, Tab, Tabs } from "@heroui/react"
import { useDispatch } from "react-redux"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { AppDispatch } from "@/store/store"
import { fetchWallet } from "@/store/walletSlice"
import { accountName, formatAccountDate, formatCoins } from "../shared/accountFormat"
import { AccountStatus } from "../shared/AccountStatus"
import { useAccountQuery } from "../shared/useAccountQuery"
import { AdjustmentForm } from "../wallet/AdjustmentForm"
import { RoleChoices } from "./RoleChoices"
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
    <Modal isOpen size="4xl" scrollBehavior="inside" onOpenChange={(open) => { if (!open) onClose() }}>
      <ModalContent dir="rtl" className="account-workspace__modal">
        <ModalHeader>{user ? accountName(user) : "جزئیات کاربر"}</ModalHeader>
        <ModalBody>
          <AccountStatus loading={detail.loading} error={detail.error} retry={detail.refresh} />
          {user && (
            <Tabs aria-label="جزئیات کاربر" selectedKey={section} onSelectionChange={(key) => setSection(String(key))}>
              <Tab key="account" title="حساب">
                <div className="account-workspace__stack">
                  <dl className="account-workspace__definitions">
                    <div><dt>ایمیل</dt><dd><bdi>{user.email}</bdi></dd></div>
                    <div><dt>تأیید ایمیل</dt><dd>{user.is_email_verified ? "تأیید شده" : "تأیید نشده"}</dd></div>
                    <div><dt>آخرین ورود</dt><dd>{formatAccountDate(user.last_login)}</dd></div>
                    <div><dt>تاریخ ثبت نام</dt><dd>{formatAccountDate(user.created_at)}</dd></div>
                    {user.profile.job_title && <div><dt>عنوان شغلی</dt><dd>{user.profile.job_title}</dd></div>}
                    {user.profile.company && <div><dt>سازمان</dt><dd>{user.profile.company}</dd></div>}
                    {user.profile.department && <div><dt>واحد</dt><dd>{user.profile.department}</dd></div>}
                    <div><dt>گروه‌ها</dt><dd>{user.groups.map((group) => group.name).join("، ") || "—"}</dd></div>
                  </dl>
                  <form className="account-workspace__form" onSubmit={save}>
                    <AccountStatus loading={roles.loading} error={roles.error} retry={roles.refresh} />
                    {roles.data && <RoleChoices label="نقش‌های سامانه" selected={roleIds} onChange={setRoleIds}
                      roles={roles.data.filter((role) => role.scope === "platform" && role.code !== "user")} />}
                    <label className="account-workspace__check"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />حساب فعال</label>
                    <Button className="account-workspace__submit" color="primary" type="submit" isLoading={saving} isDisabled={!roles.data}>ذخیره دسترسی حساب</Button>
                    {status && <p role="status">{status}</p>}
                    {error && <p role="alert">{error}</p>}
                  </form>
                </div>
              </Tab>
              <Tab key="projects" title="پروژه‌ها"><UserProjectsSection id={id} /></Tab>
              <Tab key="messages" title="پیام‌ها"><UserMessagesSection id={id} /></Tab>
              <Tab key="wallet" title="اعتبار">
                <div className="account-workspace__stack">
                  <p>موجودی {formatCoins(user.wallet.balance)} Beat Coin · ماهانه {formatCoins(user.wallet.monthly_balance)} · دائمی {formatCoins(user.wallet.permanent_balance)}</p>
                  <AdjustmentForm save={(data) => accountApi.adjustUser(id, data)} onSaved={() => {
                    setLedgerRevision((value) => value + 1)
                    void detail.refresh()
                    onUpdated()
                    if (viewerId === id) void dispatch(fetchWallet())
                  }} />
                  <UserLedgerSection id={id} revision={ledgerRevision} />
                </div>
              </Tab>
              <Tab key="audit" title="رویدادها"><UserAuditSection id={id} /></Tab>
            </Tabs>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
