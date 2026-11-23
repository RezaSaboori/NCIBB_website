import { Switch } from "@heroui/react"
import type { FormEvent, ReactNode } from "react"
import { GlassButton } from "@/components/ui/GlassButton"
import { GlassCard } from "@/components/ui/GlassCard"
import type { Role, UserDetail } from "@/types/account"
import { formatAccountDate } from "../shared/accountFormat"
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
      <GlassCard size="sm">
        <dl className="profile-user-account__details">
          <div className="profile-user-account__email"><dt>ایمیل</dt><dd><bdi>{user.email}</bdi></dd></div>
          <div><dt>تأیید ایمیل</dt><dd>{user.is_email_verified ? "تأیید شده" : "تأیید نشده"}</dd></div>
          <div><dt>آخرین ورود</dt><dd>{formatAccountDate(user.last_login)}</dd></div>
          <div><dt>تاریخ ثبت نام</dt><dd>{formatAccountDate(user.created_at)}</dd></div>
          {user.profile.job_title && <div><dt>عنوان شغلی</dt><dd>{user.profile.job_title}</dd></div>}
          {user.profile.company && <div><dt>سازمان</dt><dd>{user.profile.company}</dd></div>}
          {user.profile.department && <div><dt>واحد</dt><dd>{user.profile.department}</dd></div>}
          <div><dt>گروه‌ها</dt><dd>{user.groups.map((group) => group.name).join("، ") || "—"}</dd></div>
        </dl>
      </GlassCard>
      <form className="profile-user-account__form" onSubmit={onSave}>
        <GlassCard size="sm" heading={<h3>دسترسی حساب</h3>} footer={(
          <div className="profile-user-account__actions">
            <Switch size="sm" isSelected={active} onValueChange={onActiveChange}>حساب فعال</Switch>
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
