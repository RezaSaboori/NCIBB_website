import { useEffect, useId, useState, type ReactNode, type RefObject } from "react"
import { GlassCard } from "@/components/ui/GlassCard"
import { GlassButton } from "@/components/ui/GlassButton"
import { ScrollText } from "@/components/ui/motion/ScrollText"
import { SearchInput, SelectInput } from "@/components/ui/inputs"
import type { Page, Thread, TicketOwnerFilter, TicketStatus } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { PageControls } from "../shared/PageControls"
import { formatAccountDate, formatCoins } from "../shared/accountFormat"
import { SearchIcon } from "@/components/icons"
import { TicketBadge } from "./TicketBadge"
import { ticketStatusOptions } from "./ticketStatus"

export interface ConversationFilters {
  search: string
  status: TicketStatus | ""
  owner: TicketOwnerFilter | ""
}

const ownerOptions = [
  { value: "", label: "همهٔ مسئولان" },
  { value: "mine", label: "تیکت‌های من" },
  { value: "unassigned", label: "بدون مسئول" },
]
const statusOptions = [{ value: "", label: "همهٔ وضعیت‌ها" }, ...ticketStatusOptions]

export function ConversationList({
  queue, userId, newConversation, activeId, page, filters, data, loading, error, listRef, scrollRef, onPage, onChange, onSelect, onRetry,
}: {
  queue: boolean
  userId: number
  newConversation: ReactNode
  activeId?: number
  page: number
  filters: ConversationFilters
  data?: Page<Thread>
  loading: boolean
  error: string
  listRef: RefObject<HTMLDivElement>
  scrollRef: RefObject<HTMLDivElement>
  onPage: (page: number) => void
  onChange: (filters: ConversationFilters) => void
  onSelect: (thread: Thread) => void
  onRetry: () => void
}) {
  const id = useId()
  const [search, setSearch] = useState(filters.search)
  useEffect(() => { setSearch(filters.search) }, [filters.search])
  const searchLabel = "جستجو در موضوع گفتگو"
  return (
    <div className="account-messages__list-pane" ref={listRef}>
      <GlassCard size="sm" className="account-messages__list"
        heading={<div className="account-workspace__toolbar"><h2 tabIndex={-1}>لیست پیام ها</h2>{newConversation}</div>}
        footer={<PageControls data={data} page={page} onPage={onPage} />}>
        <form onSubmit={(event) => {
          event.preventDefault()
          const query = search.trim()
          if (query !== filters.search) onChange({ ...filters, search: query })
        }}>
          <SearchInput className="ui-input-shell--persian" placeholder={searchLabel} ariaLabel={searchLabel} value={search}
            onChange={(value) => {
              setSearch(value)
              if (!value && filters.search) onChange({ ...filters, search: "" })
            }}
            icon={<GlassButton type="submit" isIconOnly inset aria-label="جستجو">
              <SearchIcon />
            </GlassButton>} />
        </form>
        {queue && <div className="account-messages__filters">
          <label htmlFor={`${id}-status`} className="account-messages__field">وضعیت
            <SelectInput id={`${id}-status`} value={filters.status} options={statusOptions}
              onChange={(status) => onChange({ ...filters, status: status as ConversationFilters["status"] })} />
          </label>
          <label htmlFor={`${id}-owner`} className="account-messages__field">مسئول
            <SelectInput id={`${id}-owner`} value={filters.owner} options={ownerOptions}
              onChange={(owner) => onChange({ ...filters, owner: owner as ConversationFilters["owner"] })} />
          </label>
        </div>}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Give keyboard users direct access to the scrolling list. */}
        <div ref={scrollRef} className="account-messages__list-scroll custom-scrollbar" role="region" aria-label="گفتگوها" tabIndex={0}>
          <AccountStatus loading={loading && !data} error={error} retry={onRetry} />
          {!loading && !error && data?.results.length === 0 && (
            <p className="account-workspace__muted" role="status">گفتگویی با این جستجو یا فیلتر پیدا نشد.</p>
          )}
          {data?.results.map((item) => (
            <button type="button" key={item.id} data-thread-id={item.id} aria-pressed={activeId === item.id}
              className="glass account-messages__thread ui-scroll-text-trigger"
              onClick={() => onSelect(item)}>
              <span className="account-messages__panel-heading">
                <bdi className="account-messages__counterpart" title={item.counterpart}>{item.counterpart}</bdi>
                <strong className="account-messages__subject"><ScrollText text={item.subject} stopTouchPropagation /></strong>
                <span className="account-messages__heading-actions">
                  {item.unread_count > 0 && <span className="red-glass account-messages__unread"
                    aria-label={`${formatCoins(item.unread_count)} پیام خوانده‌نشده`}>{formatCoins(item.unread_count)}</span>}
                  <TicketBadge ticket={item.ticket} number={item.id} />
                </span>
              </span>
              {item.preview && (
                <span className={`account-messages__preview-row${item.preview_sender === userId ? " account-messages__preview-row--mine" : ""}`}>
                  <span className={`account-messages__preview ${item.preview_sender === userId ? "green-glass" : "glass"}`} dir="auto">{item.preview}</span>
                  <time dateTime={item.preview_created_at ?? item.updated_at}>
                    {formatAccountDate(item.preview_created_at ?? item.updated_at)}
                  </time>
                </span>
              )}
              {item.ticket?.assignee !== undefined && (
                <small className="account-messages__thread-owner">
                  <span>مسئول رسیدگی</span>
                  <bdi>{item.ticket.assignee?.name ?? "بدون مسئول"}</bdi>
                </small>
              )}
            </button>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
