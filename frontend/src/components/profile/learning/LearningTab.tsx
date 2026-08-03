import React from "react"
// @ts-expect-error JS module without types
import PreferencesSettings from "../PreferencesSettings"

interface LearningTabProps {
  preferencesData: any
  onUpdate: (data: any) => Promise<any>
  saving: boolean
}

const LearningTab: React.FC<LearningTabProps> = ({ preferencesData, onUpdate, saving }) => (
  <PreferencesSettings
    preferencesData={preferencesData}
    onUpdate={onUpdate}
    saving={saving}
  />
)

export default LearningTab