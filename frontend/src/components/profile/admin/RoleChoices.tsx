import type { Role } from "@/types/account"

export function RoleChoices({ roles, selected, onChange, label, disabled = false }: {
  roles: Role[]; selected: number[]; onChange: (ids: number[]) => void; label: string; disabled?: boolean
}) {
  return (
    <fieldset className="account-workspace__options" disabled={disabled}>
      <legend>{label}</legend>
      {roles.map((role) => (
        <label key={role.id}>
          <input type="checkbox" checked={selected.includes(role.id)} onChange={(event) => onChange(
            event.target.checked ? [...selected, role.id] : selected.filter((id) => id !== role.id)
          )} />
          {role.label}
        </label>
      ))}
    </fieldset>
  )
}
