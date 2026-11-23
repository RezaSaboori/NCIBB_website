import React from "react"
import ProfileForm from "../ProfileForm"

interface AccountTabProps {
  profileData: any
  onUpdate: (data: any) => Promise<any>
  saving: boolean
  onRefresh: () => void
}

const AccountTab: React.FC<AccountTabProps> = ({ profileData, onUpdate, saving, onRefresh }) => (
  <ProfileForm
    profileData={profileData}
    onUpdate={onUpdate}
    saving={saving}
    onRefresh={onRefresh}
  />
)

export default AccountTab