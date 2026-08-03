import React from "react"
// @ts-expect-error JS module without types
import SecuritySettings from "../SecuritySettings"
// @ts-expect-error JS module without types
import PreferencesSettings from "../PreferencesSettings"

interface SecurityTabProps {
  userData: any
  preferencesData: any
  onUpdate: (data: any) => Promise<any>
  saving: boolean
}

const SecurityTab: React.FC<SecurityTabProps> = ({ userData, preferencesData, onUpdate, saving }) => (
  <div className="space-y-6">
    <PreferencesSettings
      preferencesData={preferencesData}
      onUpdate={onUpdate}
      saving={saving}
    />
    <SecuritySettings
      userData={userData}
      onUpdate={onUpdate}
      saving={saving}
    />
  </div>
)

export default SecurityTab