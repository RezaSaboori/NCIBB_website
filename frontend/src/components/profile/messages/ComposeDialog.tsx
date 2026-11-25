import { SingleLineInput, SelectInput, MessageInput } from "@/components/ui/inputs"
import { GlassButton } from "@/components/ui/GlassButton"
import { StatefulGlassButton } from "@/components/ui/StatefulGlassButton"
import { useId, useRef, useState, type FormEvent } from "react"
import { ProfileModal } from "../shared/ProfileModal"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { Destination, Thread, ThreadMessage } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { MessageHistory } from "./MessageHistory"
import { useMessagingSearch } from "./useMessagingSearch"

const destinationKey = (destination: Destination) => [destination.kind, destination.recipient, destination.group].join(":")
const destinationName = (destination: Destination) => destination.group
  ? `${destination.label} · گروه ${destination.group}` : destination.label

export function ComposeDialog({ isOpen, source, selected, userId, onClose, onSent }: {
  isOpen: boolean
  source?: Thread
  selected: ThreadMessage[]
  userId: number
  onClose: () => void
  onSent: (thread: Thread) => void
}) {
  const formId = useId()
  const [recipient, setRecipient] = useState<Destination>()
  const [subject, setSubject] = useState(source ? `ارسال مجدد · ${source.subject}`.slice(0, 200) : "")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const [error, setError] = useState("")
  const destinations = useMessagingSearch(isOpen, "جستجوی گیرنده", accountApi.destinations)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!recipient || pending.current || !subject.trim() || (!source && !content.trim())) return
    const payload = {
      kind: recipient.kind, recipient: recipient.recipient, group: recipient.group,
      subject: subject.trim(), content: content.trim(),
    }
    pending.current = true
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
      pending.current = false
      setSaving(false)
    }
  }

  return (
    <ProfileModal isOpen={isOpen} size="lg" surface="glass" title={source ? "ارسال به دیگری" : "گفتگوی جدید"}
      onOpenChange={(open) => { if (!open && !pending.current) onClose() }}
      footer={(
        <>
          <GlassButton variant="flat" isDisabled={saving} onPress={onClose}>انصراف</GlassButton>
          <StatefulGlassButton type="submit" form={formId} color={saving ? "pending" : "primary"}
            state={saving ? "sending" : "ready"} label={saving ? "در حال ارسال…" : "ارسال"}
            busy={saving} disabled={!recipient || !subject.trim() || (!source && !content.trim())} />
        </>
      )}>
      <form id={formId} className="account-workspace__form" onSubmit={submit}>
        <label htmlFor={`${formId}-recipient`}>گیرنده
          <SelectInput id={`${formId}-recipient`} required disabled={saving}
            value={recipient && destinationKey(recipient)} selectedLabel={recipient && destinationName(recipient)}
            onChange={(value) => setRecipient(destinations.options.find((option) => destinationKey(option) === value))}
            placeholder="انتخاب گیرنده" remoteSearch={destinations.remoteSearch}
            options={destinations.options.map((option) => ({ value: destinationKey(option), label: destinationName(option) }))} />
        </label>
        <label htmlFor={`${formId}-subject`}>موضوع<SingleLineInput id={`${formId}-subject`} required disabled={saving} maxLength={200} value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
        {source && <section className="account-messages__forward-preview" aria-labelledby={`${formId}-preview`}>
          <h3 id={`${formId}-preview`}>پیش‌نمایش پیام‌های انتخاب‌شده</h3>
          <MessageHistory messages={[...selected].sort((first, second) => second.id - first.id)} userId={userId} />
        </section>}
        <label htmlFor={`${formId}-content`}>{source ? "یادداشت (اختیاری)" : "متن پیام"}
          <MessageInput id={`${formId}-content`} required={!source} disabled={saving} maxLength={6000} rows={5} value={content} onChange={(event) => setContent(event.target.value)} />
        </label>
        <AccountStatus error={error} />
      </form>
    </ProfileModal>
  )
}
