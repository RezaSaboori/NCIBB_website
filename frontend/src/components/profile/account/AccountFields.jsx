import { useId } from "react"
import { Controller } from "react-hook-form"
import { GlassButton } from "@/components/ui/GlassButton"
import { GlassCard } from "@/components/ui/GlassCard"
import { SelectInput, SingleLineInput } from "@/components/ui/inputs"
import { ProfileSaveAction } from "./ProfileSaveAction"

const basicFields = [
  { key: "first_name", label: "نام" },
  { key: "last_name", label: "نام خانوادگی" },
  { key: "email", label: "ایمیل", type: "email", dir: "ltr" },
  { key: "phone", label: "شماره موبایل", type: "tel", dir: "ltr" },
  { key: "gender", label: "جنسیت", options: [
    { value: "male", label: "مرد" },
    { value: "female", label: "زن" },
    { value: "other", label: "سایر" },
    { value: "prefer_not_to_say", label: "ترجیح می‌دهم اعلام نکنم" },
  ] },
  { key: "city", label: "شهر" },
  { key: "state_province", label: "استان" },
  { key: "country", label: "کشور" },
]

const professionalFields = [
  { key: "job_title", label: "عنوان شغلی" },
  { key: "company", label: "شرکت / سازمان" },
  { key: "department", label: "واحد / دپارتمان" },
]

export default function AccountFields({
  kind, control, dirtyFields, errors, editing, onEdit, onCancel, onSubmit, saving, phase, isValid,
}) {
  const formId = useId()
  const title = kind === "basic" ? "اطلاعات پایه" : "اطلاعات حرفه‌ای"
  const fields = kind === "basic" ? basicFields : professionalFields
  const canSave = isValid && fields.some(({ key }) => dirtyFields[key])

  return (
    <GlassCard heading={<h2>{title}</h2>} footer={(
      <>
        <ProfileSaveAction formId={formId} title={title} editing={editing} canSave={canSave} locked={saving} phase={phase} onEdit={onEdit} />
        {editing && <GlassButton className="ui-fade-in" isDisabled={saving} onPress={onCancel}>لغو</GlassButton>}
      </>
    )}>
      <form id={formId} className="account-workspace__form account-workspace__fields" noValidate onSubmit={(event) => {
        if (editing && canSave && !saving && phase !== "saved") void onSubmit(event)
        else event.preventDefault()
      }}>
        {fields.map(({ key, label, type, dir, options }) => (
          <Controller key={key} control={control} name={key} render={({ field }) => {
            const error = errors[key]?.message
            const errorId = `${formId}-${key}-error`
            return (
              <label>
                {label}
                {options ? (
                  <SelectInput {...field} disabled={!editing || saving} options={[{ value: "", label: "—" }, ...options]}
                    aria-invalid={error ? "true" : undefined} aria-describedby={error ? errorId : undefined} />
                ) : (
                  <SingleLineInput {...field} type={type} dir={dir} disabled={!editing} readOnly={saving}
                    aria-invalid={error ? "true" : undefined} aria-describedby={error ? errorId : undefined} />
                )}
                {error && <small id={errorId} role="alert" className="account-workspace__error">{error}</small>}
              </label>
            )
          }} />
        ))}
      </form>
    </GlassCard>
  )
}
