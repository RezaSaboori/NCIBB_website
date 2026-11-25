import { useId, useRef, useState } from "react"
import axios from "axios"
import { GlassButton } from "@/components/ui/GlassButton"
import { SelectInput } from "@/components/ui/inputs"
import { StatefulGlassButton } from "@/components/ui/StatefulGlassButton"
import { useToast } from "@/components/ui/motion/useToast"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { Thread, TicketAssignee, TicketStatus, TicketUpdate } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { ticketStatusOptions } from "./ticketStatus"
import { useMessagingSearch } from "./useMessagingSearch"

interface OwnerEditor {
  expectedId: number | null
  choice?: TicketAssignee
}

export function TicketControls({ thread, userId, onUpdated, onConflict }: {
  thread: Thread
  userId: number
  onUpdated: (thread: Thread) => void
  onConflict: () => void
}) {
  const id = useId()
  const [editor, setEditor] = useState<OwnerEditor>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const pending = useRef(false)
  const announce = useToast()
  const assignees = useMessagingSearch(Boolean(editor), "جستجوی مسئول رسیدگی", accountApi.ticketAssignees)
  const ticket = thread.ticket
  if (!ticket || ticket.assignee === undefined) return null
  const assignee = ticket.assignee
  const assigneeId = assignee?.id ?? null

  const update = async (change: TicketUpdate) => {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError("")
    try {
      onUpdated(await accountApi.updateTicket(thread.id, change))
      if ("assignee_id" in change) setEditor(undefined)
      announce({ tone: "success", message: "تیکت به‌روزرسانی شد." })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setEditor(undefined)
        setError("مسئول رسیدگی تغییر کرده است. اطلاعات تیکت به‌روز می‌شود.")
        onConflict()
      } else {
        setError(accountError(error))
      }
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return (
    <div className="account-messages__triage" aria-busy={busy}>
      <label className="account-messages__field account-messages__triage-status" htmlFor={`${id}-status`}>وضعیت تیکت
        <SelectInput id={`${id}-status`} value={ticket.status} disabled={busy} options={ticketStatusOptions}
          onChange={(value) => void update({ status: value as TicketStatus })} />
      </label>
      <div className="account-messages__field">
        <span>مسئول رسیدگی</span>
        <div className="account-messages__triage-owner">
          <bdi>{assignee?.name ?? "بدون مسئول"}</bdi>
          <div className="account-workspace__actions">
            {!editor && <GlassButton size="sm" variant="flat" isDisabled={busy}
              onPress={() => setEditor({ expectedId: assigneeId, choice: assignee ?? undefined })}>
              {assignee ? "تغییر مسئول" : "تعیین مسئول"}
            </GlassButton>}
            {assignee ? (
              <GlassButton size="sm" variant="flat" isDisabled={busy}
                onPress={() => void update({ assignee_id: null, expected_assignee_id: assigneeId })}>برداشتن مسئول</GlassButton>
            ) : (
              <GlassButton size="sm" color="primary" isDisabled={busy}
                onPress={() => void update({ assignee_id: userId, expected_assignee_id: null })}>به عهده می‌گیرم</GlassButton>
            )}
          </div>
        </div>
      </div>
      {editor && (
        <div className="account-messages__triage-editor">
          <label className="account-messages__field" htmlFor={`${id}-assignee`}>انتخاب مسئول رسیدگی
            <SelectInput id={`${id}-assignee`} value={editor.choice?.id} selectedLabel={editor.choice?.name}
              placeholder="انتخاب کارشناس" disabled={busy} remoteSearch={assignees.remoteSearch}
              options={assignees.options.map(({ id, name }) => ({ value: String(id), label: name }))}
              onChange={(value) => setEditor({ ...editor, choice: assignees.options.find(({ id }) => id === Number(value)) })} />
          </label>
          <div className="account-workspace__actions">
            <StatefulGlassButton type="button" size="sm" color={busy ? "pending" : "primary"} state={busy ? "saving" : "ready"}
              label={busy ? "در حال ذخیره…" : "تعیین مسئول"} busy={busy}
              disabled={!editor.choice || editor.choice.id === editor.expectedId}
              onPress={() => {
                if (editor.choice) void update({ assignee_id: editor.choice.id, expected_assignee_id: editor.expectedId })
              }} />
            <GlassButton size="sm" variant="flat" isDisabled={busy} onPress={() => setEditor(undefined)}>انصراف</GlassButton>
          </div>
        </div>
      )}
      {error && <AccountStatus error={error} />}
    </div>
  )
}
