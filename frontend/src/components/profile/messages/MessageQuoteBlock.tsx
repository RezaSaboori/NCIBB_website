import type { MessageQuote } from "@/types/account"

export function MessageQuoteBlock({ quote, showSender, onJump }: { quote: MessageQuote; showSender?: boolean; onJump?: () => void }) {
  const preview = (
    <>
      {showSender && <strong dir="auto">{quote.sender_name}</strong>}
      <span dir="auto">{quote.excerpt}</span>
    </>
  )
  return onJump ? (
    <button type="button" className="account-messages__quote account-messages__quote--link" onClick={onJump}>
      {preview}
    </button>
  ) : (
    <blockquote className="account-messages__quote">{preview}</blockquote>
  )
}
