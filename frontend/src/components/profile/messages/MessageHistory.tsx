import type { ThreadMessage } from "@/types/account"
import { formatAccountDate } from "../shared/accountFormat"

export function MessageHistory({ messages, userId, selected, toggle }: {
  messages: ThreadMessage[]
  userId?: number
  selected?: ThreadMessage[]
  toggle?: (message: ThreadMessage) => void
}) {
  if (!messages.length) return <p className="account-workspace__muted">پیامی در این گفتگو ثبت نشده است.</p>
  return (
    <ol className="account-messages__history" aria-label="پیام‌های گفتگو">
      {[...messages].reverse().map((message) => (
        <li key={message.id} className={`glass account-messages__bubble${message.sender === userId ? " account-messages__bubble--mine" : ""}`}>
          <div className="account-messages__meta">
            <b>{message.sender_name}</b>
            <time dateTime={message.created_at}>{formatAccountDate(message.created_at)}</time>
            {toggle && (
              <label className="account-messages__select">
                <input type="checkbox" aria-label={`انتخاب پیام ${message.sender_name} برای ارسال مجدد`}
                  checked={!!selected?.some(({ id }) => id === message.id)} onChange={() => toggle(message)} />
              </label>
            )}
          </div>
          {message.forwarded && <small>ارسال‌شده از گفتگوی دیگر</small>}
          <p dir="auto">{message.content}</p>
        </li>
      ))}
    </ol>
  )
}
