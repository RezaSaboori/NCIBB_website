import type { FormEvent, ReactNode } from "react"
import { GlassButton } from "@/components/ui/GlassButton"
import { GlassCard } from "@/components/ui/GlassCard"
import { GlassSwitch } from "@/components/ui/inputs"
import type { Role, UserDetail } from "@/types/account"
import { formatAccountDate } from "../shared/accountFormat"
import { ProfileDetailCards } from "../shared/ProfileDetailCards"
import { RoleChoices } from "./RoleChoices"
import "./UserAccountSection.css"

interface UserAccountSectionProps {
  user: UserDetail
  roles?: Role[]
  accessFeedback: ReactNode
  active: boolean
  selectedRoles: number[]
  saving: boolean
  onActiveChange: (active: boolean) => void
  onRolesChange: (roles: number[]) => void
  onSave: (event: FormEvent<HTMLFormElement>) => void
  saveFeedback: ReactNode
}

export function UserAccountSection({
  user, roles, accessFeedback, active, selectedRoles, saving, onActiveChange, onRolesChange, onSave, saveFeedback,
}: UserAccountSectionProps) {
  return (
    <div className="profile-user-account">
      <GlassCard size="sm" className="profile-detail-card-group profile-detail-card-group--account">
        <ProfileDetailCards items={[
          { label: "ایمیل", value: <bdi>{user.email}</bdi>, fullWidthOnMobile: true },
          { label: "تأیید ایمیل", value: user.is_email_verified ? "تأیید شده" : "تأیید نشده" },
          { label: "آخرین ورود", value: formatAccountDate(user.last_login) },
          { label: "تاریخ ثبت نام", value: formatAccountDate(user.created_at) },
          ...(user.profile.job_title ? [{ label: "عنوان شغلی", value: user.profile.job_title }] : []),
          ...(user.profile.company ? [{ label: "سازمان", value: user.profile.company }] : []),
          ...(user.profile.department ? [{ label: "واحد", value: user.profile.department }] : []),
          { label: "گروه‌ها", value: user.groups.map((group) => group.name).join("، ") || "—" },
        ]} />
      </GlassCard>
      <form className="profile-user-account__form" onSubmit={onSave}>
        <GlassCard size="sm" heading={<h3>دسترسی حساب</h3>} footer={(
          <div className="profile-user-account__actions">
            <GlassSwitch label="حساب فعال" checked={active} onChange={(event) => onActiveChange(event.target.checked)} />
            <GlassButton color="primary" type="submit" isLoading={saving} isDisabled={!roles}>ذخیره دسترسی حساب</GlassButton>
          </div>
        )}>
          {accessFeedback}
          {roles && <RoleChoices className="profile-user-account__roles" label="نقش‌های سامانه" selected={selectedRoles} onChange={onRolesChange} roles={roles} />}
          {saveFeedback}
        </GlassCard>
      </form>
    </div>
  )
}
