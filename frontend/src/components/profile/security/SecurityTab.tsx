import SecuritySettings from "../SecuritySettings"
import PreferencesSettings from "../PreferencesSettings"

export default function SecurityTab() {
  return <div className="space-y-6"><PreferencesSettings /><SecuritySettings /></div>
}
