import { StatefulGlassButton } from "@/components/ui/StatefulGlassButton"
import type { ProfileSavePhase } from "./useProfileSaveFeedback"

type ProfileSaveActionProps = {
  formId: string
  title: string
  editing: boolean
  canSave: boolean
  locked: boolean
  phase?: ProfileSavePhase
  onEdit: () => void
}

const label = {
  edit: "ویرایش",
  save: "ذخیره تغییرات",
  saving: "در حال ذخیره…",
  saved: "ذخیره شد",
  failed: "تلاش دوباره",
}

const iconPath = {
  edit: "m15 5 4 4M4 20l4.5-1 11-11-3.5-3.5-11 11L4 20Z",
  save: "M5 4h12l3 3v13H4V4h1Zm3 0v6h8V4M8 20v-6h8v6",
  saving: "M12 3a9 9 0 1 1-9 9",
  saved: "m5 12 4 4L19 6",
  failed: "M4 12a8 8 0 1 1 3 6.25M4 5v7h7",
}

export function ProfileSaveAction({ formId, title, editing, canSave, locked, phase, onEdit }: ProfileSaveActionProps) {
  const state = phase === "saving" || phase === "saved" ? phase : editing ? phase ?? "save" : "edit"
  const canSubmit = editing && state !== "saved"
  const color = state === "saved" ? "success" : state === "saving" ? "pending" : canSubmit && canSave ? "primary" : undefined

  return (
    <StatefulGlassButton state={state} label={label[state]} accessibleLabel={state === "edit" ? `ویرایش ${title}` : label[state]}
      form={formId} type={canSubmit ? "submit" : "button"} onPress={canSubmit ? undefined : onEdit}
      color={color} busy={state === "saving"} disabled={locked || state === "saved" || (canSubmit && !canSave)}
      icon={
        <svg className={state === "saving" ? "motion-safe:animate-spin" : undefined}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={iconPath[state]} />
        </svg>
      } />
  )
}
