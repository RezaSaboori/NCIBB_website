import { useId, type RefObject } from "react"
import { GlassButton } from "@/components/ui/GlassButton"
import { MessageQuoteBlock } from "./MessageQuoteBlock"
import { MessagingIcon } from "./MessagingIcon"
import type { ConversationDraft } from "./useConversationDrafts"
import { useReplyInputSize } from "./useReplyInputSize"

const replyPlaceholder = "لطفا پیام خود را بنویسید"

export function ReplyComposer({ inputRef, draft, expanded, reopensTicket, onExpand, onChange, onClearQuote, onSend }: {
  inputRef: RefObject<HTMLTextAreaElement>
  draft: ConversationDraft
  expanded: boolean
  reopensTicket: boolean
  onExpand: (value: boolean) => void
  onChange: (content: string) => void
  onClearQuote: () => void
  onSend: () => void
}) {
  const canExpand = useReplyInputSize(inputRef, draft.content, expanded, onExpand)
  const feedbackId = useId()
  const sendLabel = draft.sending ? "در حال ارسال…" : draft.error ? "تلاش دوباره برای ارسال" : "ارسال پاسخ"

  return (
    <form className="account-messages__composer" onSubmit={(event) => { event.preventDefault(); onSend() }}>
      {draft.quote && <div className="account-messages__reply-preview">
        <MessageQuoteBlock quote={draft.quote} />
        <GlassButton size="sm" type="button" isIconOnly isDisabled={draft.sending} className="account-messages__composer-icon"
          aria-label="حذف نقل‌قول" onPress={onClearQuote}>
          <MessagingIcon name="close" />
        </GlassButton>
      </div>}
      <div className="glass ui-input-shell ui-input-shell--persian account-messages__composer-shell">
        <textarea ref={inputRef} className="ui-input-field ui-input-field--textarea account-messages__composer-input custom-scrollbar"
          aria-label={replyPlaceholder} placeholder={replyPlaceholder} dir={draft.content ? "auto" : "rtl"} maxLength={6000} rows={1}
          aria-describedby={draft.error ? feedbackId : undefined}
          value={draft.content} readOnly={draft.sending} onChange={(event) => onChange(event.target.value)} />
        <div className="account-messages__composer-actions">
          {(canExpand || expanded) && (
            <GlassButton type="button" size="sm" isIconOnly className="account-messages__composer-icon"
              aria-label={expanded ? "کوچک کردن کادر پیام" : "گسترش کادر پیام"}
              onPress={() => { onExpand(!expanded); inputRef.current?.focus({ preventScroll: true }) }}>
              <MessagingIcon name={expanded ? "collapse" : "expand"} />
            </GlassButton>
          )}
          <GlassButton type="submit" size="sm" isIconOnly className="account-messages__composer-icon account-messages__composer-send"
            color={draft.sending ? "pending" : "primary"} aria-label={sendLabel} aria-busy={draft.sending || undefined}
            isDisabled={draft.sending || !draft.content.trim()}>
            <MessagingIcon name={draft.sending ? "pending" : "send"} />
          </GlassButton>
        </div>
      </div>
      <p id={feedbackId} className="account-messages__composer-error account-workspace__error" role="status">{draft.error}</p>
      {reopensTicket && <p className="account-workspace__muted account-messages__reopen">ارسال پیام، این تیکت را دوباره باز می‌کند.</p>}
    </form>
  )
}
