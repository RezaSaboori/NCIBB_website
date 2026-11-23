import { SingleLineInput, SelectInput } from "@/components/ui/inputs"
import { GlassButton } from "@/components/ui/GlassButton"
import { useRef, useState, type FormEvent } from "react"
import { accountError } from "@/dataset_services/accountApi"
import type { Adjustment } from "@/types/account"

export function AdjustmentForm({ save, onSaved, shared = false }: { save: (data: Adjustment) => Promise<unknown>; onSaved: () => void; shared?: boolean }) {
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [direction, setDirection] = useState("add")
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const lastRequest = useRef<{ key: string; id: string }>()

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = amount.replace(/[۰-۹٠-٩]/g, (character) => String(character.charCodeAt(0) & 15))
      .replace("٫", ".").trim()
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(normalized) || Number(normalized) <= 0 || !reason.trim()) {
      setError("مبلغ مثبت با حداکثر دو رقم اعشار و دلیل تغییر را وارد کنید.")
      return
    }
    const signed = direction === "add" ? normalized : `-${normalized}`
    const key = JSON.stringify([signed, reason.trim()])
    if (lastRequest.current?.key !== key) lastRequest.current = { key, id: crypto.randomUUID() }

    setSaving(true)
    setError("")
    setStatus("")
    try {
      await save({ amount: signed, reason: reason.trim(), request_id: lastRequest.current.id })
      lastRequest.current = undefined
      setAmount("")
      setReason("")
      setStatus("تغییر موجودی ثبت شد.")
      onSaved()
    } catch (error) {
      setError(accountError(error))
    } finally {
      setSaving(false)
    }
  }
  return (
    <form className="account-workspace__form" onSubmit={submit}>
      <div className="account-workspace__fields">
        <label>نوع تغییر<SelectInput value={direction} onChange={setDirection} options={[
          { value: "add", label: `افزایش اعتبار ${shared ? "اشتراکی" : "دائمی"}` },
          { value: "subtract", label: `کاهش اعتبار ${shared ? "اشتراکی" : "دائمی"}` },
        ]} /></label>
        <label>مبلغ Beat Coin<SingleLineInput required inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
        <label>دلیل تغییر<SingleLineInput required maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
      </div>
      <GlassButton className="account-workspace__submit" type="submit" color="primary" isLoading={saving}>ثبت تغییر</GlassButton>
      {status && <p role="status">{status}</p>}
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
