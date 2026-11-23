import { GlassChoice } from "@/components/ui/inputs"
import type { Role } from "@/types/account"

export function RoleChoices({ roles, selected, onChange, label, disabled = false, className = "" }: {
  roles: Role[]; selected: number[]; onChange: (ids: number[]) => void; label: string; disabled?: boolean; className?: string
}) {
  return (
    <fieldset className={`account-workspace__options ${className}`} disabled={disabled}>
      <legend>{label}</legend>
      {roles.map((role) => (
        <GlassChoice key={role.id} label={role.label}
          checked={selected.includes(role.id)} onChange={(event) => onChange(
            event.target.checked ? [...selected, role.id] : selected.filter((id) => id !== role.id)
          )} />
      ))}
    </fieldset>
  )
}
