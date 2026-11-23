import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { DropdownInput, type DropdownOption } from "./DropdownInput"

type SelectInputProps = Omit<ComponentPropsWithoutRef<typeof DropdownInput>, "multiple" | "value" | "onChange" | "options"> & {
  options: readonly DropdownOption[]
  value?: string | number | null
  onChange: (value: string) => void
}

export const SelectInput = forwardRef<HTMLButtonElement, SelectInputProps>(
  function SelectInput({ value, ...props }, ref) {
    return <DropdownInput {...props} ref={ref} value={String(value ?? "")} dir="rtl" />
  },
)
