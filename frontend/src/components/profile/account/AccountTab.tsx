import React from "react"
import type { AccountProfile } from "@/types/account"
import ProfileForm from "../ProfileForm"

interface AccountTabProps {
  profileData: AccountProfile
  onUpdate: (data: Record<string, unknown>) => Promise<AccountProfile>
  onRefresh: () => Promise<void>
}

const AccountTab: React.FC<AccountTabProps> = ({ profileData, onUpdate, onRefresh }) => (
  <ProfileForm
    profileData={profileData}
    onUpdate={onUpdate}
    onRefresh={onRefresh}
  />
)

export default AccountTab
