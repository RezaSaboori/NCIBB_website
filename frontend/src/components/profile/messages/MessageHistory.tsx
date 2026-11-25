import { useRef } from "react"
import { motion } from "framer-motion"
import { GlassButton } from "@/components/ui/GlassButton"
import { useMotionVariants } from "@/components/ui/motion/useMotionVariants"
import type { ThreadMessage } from "@/types/account"
import { formatAccountDate } from "../shared/accountFormat"
import { MessageBubble } from "./MessageBubble"
import { MessageDelivery } from "./MessageDelivery"
import type { ReplyAttempt } from "./useConversationDrafts"
import "./messages.css"

export function MessageHistory({ messages, userId, showSender, onReply, replyDisabled, selection, attempt }: {
  messages: ThreadMessage[]
  userId?: number
  showSender?: boolean
  onReply?: (message: ThreadMessage) => void
  replyDisabled?: boolean
  selection?: { items: ThreadMessage[]; toggle: (message: ThreadMessage) => void; max: number }
  attempt?: ReplyAttempt & { error?: string }
}) {
  const variants = useMotionVariants("surface")
  const history = useRef<HTMLOListElement>(null)
  const visibleIds = new Set(messages.map(({ id }) => id))
  if (!messages.length && !attempt) return <p className="account-workspace__muted">پیامی در این گفتگو ثبت نشده است.</p>

  const jumpTo = (id: number) => {
    const original = history.current?.querySelector<HTMLLIElement>(`[data-message-id="${id}"]`)
    original?.focus({ preventScroll: true })
    original?.scrollIntoView({ block: "nearest" })
  }

  return (
    <ol ref={history} className="account-messages__history" aria-label="پیام‌های گفتگو">
      {[...messages].reverse().map((message, index) => {
        const mine = message.sender === userId
        const selected = selection?.items.some(({ id }) => id === message.id) ?? false
        const quote = message.reply_to
        return (
          <motion.li key={message.id} data-message-id={message.id} tabIndex={-1}
            className={`account-messages__message${mine ? " account-messages__message--mine" : ""}`}
            initial={index >= messages.length - 3 ? "exit" : false} animate="enter" variants={variants}>
            <MessageBubble mine={mine} sender={showSender ? message.sender_name : undefined} content={message.content}
              forwarded={message.forwarded} quote={quote}
              onJump={quote && visibleIds.has(quote.id) ? () => jumpTo(quote.id) : undefined} />
            <div className="account-messages__meta">
              <span className="account-messages__timestamp" dir="rtl">
                {mine && message.read_by_other != null && <MessageDelivery status={message.read_by_other ? "read" : "sent"} />}
                <time dateTime={message.created_at}>{formatAccountDate(message.created_at)}</time>
              </span>
              {onReply && <GlassButton size="sm" type="button" className="account-messages__message-action"
                aria-label={`پاسخ به پیام ${message.sender_name}`} isDisabled={replyDisabled} onPress={() => onReply(message)}>پاسخ</GlassButton>}
              {selection && <GlassButton size="sm" type="button" aria-pressed={selected} color={selected ? "primary" : undefined}
                aria-label={`انتخاب پیام ${message.sender_name} برای ارسال مجدد`}
                className="account-messages__message-action"
                isDisabled={!selected && selection.items.length >= selection.max}
                onPress={() => selection.toggle(message)}>انتخاب</GlassButton>}
            </div>
          </motion.li>
        )
      })}
      {attempt && (
        <li className="account-messages__message account-messages__message--mine">
          <MessageBubble mine content={attempt.content} quote={attempt.quote} />
          <div className="account-messages__meta">
            <span className="account-messages__timestamp" dir="rtl">
              <MessageDelivery status={attempt.error ? "failed" : "sending"} error={attempt.error} />
              <time dateTime={attempt.createdAt}>{formatAccountDate(attempt.createdAt)}</time>
            </span>
          </div>
        </li>
      )}
    </ol>
  )
}
