import type { TicketStatus } from "@/types/account"

export const ticketStatusLabel: Record<TicketStatus, string> = {
  open: "فعال",
  waiting: "در انتظار پاسخ درخواست‌کننده",
  resolved: "غیرفعال",
}

export const ticketStatusOptions = Object.entries(ticketStatusLabel).map(([value, label]) => ({ value, label }))
