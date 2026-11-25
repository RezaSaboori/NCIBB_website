import type { MessageQuote } from "@/types/account"
import { MessageQuoteBlock } from "./MessageQuoteBlock"

export function MessageBubble({ mine, sender, content, forwarded, quote, onJump }: {
  mine: boolean
  sender?: string
  content: string
  forwarded?: boolean
  quote?: MessageQuote | null
  onJump?: () => void
}) {
  return (
    <div className={`account-messages__bubble ${mine ? "green-glass" : "glass"}`}>
      {sender && <b className="account-messages__sender"><bdi>{sender}:</bdi></b>}
      {quote && <MessageQuoteBlock quote={quote} showSender={Boolean(sender)} onJump={onJump} />}
      {forwarded && <small>ارسال‌شده از گفتگوی دیگر</small>}
      <p dir="auto">{content}</p>
    </div>
  )
}
