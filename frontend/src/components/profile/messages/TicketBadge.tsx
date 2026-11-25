import type { Ticket } from "@/types/account"
import { formatCoins } from "../shared/accountFormat"
import { ticketStatusLabel } from "./ticketStatus"

export function TicketBadge({ ticket, number }: { ticket?: Ticket | null; number: number }) {
  if (ticket?.assignee === undefined) return null
  const { status } = ticket
  const active = status !== "resolved"
  return (
    <span className="glass account-messages__ticket-state"
      title={`تیکت ${formatCoins(number)} · ${ticketStatusLabel[status]}`}>
      <span aria-hidden="true" className={`account-messages__ticket-dot ${active ? "green-glass" : "red-glass"}`} />
      {active ? "فعال" : "غیرفعال"}
    </span>
  )
}
