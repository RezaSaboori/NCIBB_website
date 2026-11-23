import { SingleLineInput, SelectInput, MessageInput } from "@/components/ui/inputs"
import { GlassButton } from "@/components/ui/GlassButton"
import { useCallback, useId, useState, type FormEvent } from "react"
import { ProfileModal } from "../shared/ProfileModal"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { Destination, Thread, ThreadMessage } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { useAccountQuery } from "../shared/useAccountQuery"

const destinationKey = (destination: Destination) => [destination.kind, destination.recipient, destination.group].join(":")

export function ComposeDialog({ source, selected, onClose, onSent }: {
  source?: Thread
  selected: ThreadMessage[]
  onClose: () => void
  onSent: (thread: Thread) => void
}) {
  const formId = useId()
  const [search, setSearch] = useState("")
  const [recipient, setRecipient] = useState("")
  const [subject, setSubject] = useState(source ? `ارسال مجدد · ${source.subject}`.slice(0, 200) : "")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const destinations = useAccountQuery(useCallback(() => accountApi.destinations(search), [search]))

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const destination = destinations.data?.find((option) => destinationKey(option) === recipient)
    if (!destination) return
    const payload = {
      kind: destination.kind, recipient: destination.recipient, group: destination.group,
      subject: subject.trim(), content: content.trim(),
    }
    setSaving(true)
    setError("")
    try {
      const thread = source
        ? await accountApi.forward(source.id, { ...payload, message_ids: selected.map((message) => message.id) })
        : await accountApi.compose(payload)
      onSent(thread)
    } catch (error) {
      setError(accountError(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProfileModal isOpen size="lg" title={source ? "ارسال مجدد پیام" : "گفتگوی جدید"}
      onOpenChange={(open) => { if (!open && !saving) onClose() }}
      footer={(
        <>
          <GlassButton variant="flat" isDisabled={saving} onPress={onClose}>انصراف</GlassButton>
          <GlassButton type="submit" form={formId} color="primary" isLoading={saving}
            isDisabled={!recipient || !subject.trim() || (!source && !content.trim())}>ارسال</GlassButton>
        </>
      )}>
      <form id={formId} className="account-workspace__form" onSubmit={submit}>
        <label>جستجوی گیرنده<SingleLineInput value={search} onChange={(event) => {
          setSearch(event.target.value)
          setRecipient("")
        }} /></label>
        <AccountStatus loading={destinations.loading} error={destinations.error} retry={destinations.refresh} />
        <label>گیرنده
          <SelectInput required value={recipient} onChange={setRecipient} placeholder="انتخاب گیرنده"
            options={(destinations.data ?? []).map((option) => ({
              value: destinationKey(option),
              label: option.group ? `${option.label} · گروه ${option.group}` : option.label,
            }))} />
        </label>
        <label>موضوع<SingleLineInput required maxLength={200} value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
        {source && <div className="account-workspace__stack">
          <h3>پیش‌نمایش پیام‌های انتخاب‌شده</h3>
          {selected.map((message) => <blockquote key={message.id}>{message.content}</blockquote>)}
        </div>}
        <label>{source ? "یادداشت (اختیاری)" : "متن پیام"}
          <MessageInput required={!source} maxLength={6000} rows={5} value={content} onChange={(event) => setContent(event.target.value)} />
        </label>
        <AccountStatus error={error} />
      </form>
    </ProfileModal>
  )
}
