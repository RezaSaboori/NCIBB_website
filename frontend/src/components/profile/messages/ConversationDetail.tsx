import { useCallback, useEffect, useRef, useState } from "react"
import { GlassButton } from "@/components/ui/GlassButton"
import { GlassCard } from "@/components/ui/GlassCard"
import { ScrollText } from "@/components/ui/motion/ScrollText"
import { accountApi } from "@/dataset_services/accountApi"
import type { Thread, ThreadMessage } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { PageControls } from "../shared/PageControls"
import { formatCoins } from "../shared/accountFormat"
import { useAccountQuery } from "../shared/useAccountQuery"
import { MessageHistory } from "./MessageHistory"
import { MessagingIcon } from "./MessagingIcon"
import { ReplyComposer } from "./ReplyComposer"
import { TicketBadge } from "./TicketBadge"
import { TicketControls } from "./TicketControls"
import type { ConversationDraft } from "./useConversationDrafts"
import { useConversationTimeline } from "./useConversationTimeline"
import { useMessagingRefresh } from "./useMessagingRefresh"

const forwardLimit = 10

export function ConversationDetail({
  id, initial, userId, draft, onDraftChange, onReply, onForward, onBack, refreshList,
}: {
  id: number
  initial?: Thread
  userId: number
  draft: ConversationDraft
  onDraftChange: (changes: Partial<ConversationDraft>) => void
  onReply: () => void
  onForward: (thread: Thread, messages: ThreadMessage[]) => void
  onBack: () => void
  refreshList: () => void
}) {
  const [page, setPage] = useState(1)
  const [selection, setSelection] = useState<ThreadMessage[]>([])
  const [expanded, setExpanded] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const lastSent = useRef(draft.sent?.id)
  const lastAttempt = useRef(draft.attempt)
  const readThrough = useRef(0)
  const thread = useAccountQuery(useCallback(() => accountApi.thread(id), [id]))
  const messages = useAccountQuery(useCallback(
    () => accountApi.threadMessages(id, page).then((data) => ({ page, data })), [id, page],
  ))
  const messageData = messages.data?.page === page ? messages.data.data : undefined
  const current = thread.data ?? initial
  const newest = page === 1 ? messageData?.results[0]?.id : undefined
  const refreshHistory = messages.refresh
  const refreshThread = thread.refresh
  const refreshLatestMessages = messages.refreshInBackground
  const refreshThreadInBackground = thread.refreshInBackground
  const results = messageData?.results ?? []
  const sent = page === 1 && draft.sent && (draft.sent.id > (newest ?? 0)) ? draft.sent : undefined
  const history = sent ? [sent, ...results] : results
  const attempt = page === 1 && draft.attempt ? { ...draft.attempt, error: draft.error } : undefined
  const timeline = useConversationTimeline(page, history[0]?.id, draft.attempt?.createdAt ?? draft.sent?.id, expanded)

  useMessagingRefresh(useCallback(() => {
    void refreshThreadInBackground()
    if (page === 1) void refreshLatestMessages()
  }, [page, refreshLatestMessages, refreshThreadInBackground]))

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ block: "nearest" })
  }, [])

  useEffect(() => {
    const markLatest = () => {
      if (expanded || !newest || readThrough.current >= newest || document.visibilityState !== "visible") return
      const previous = readThrough.current
      readThrough.current = newest
      void accountApi.markRead(id, newest).then(refreshList, () => {
        if (readThrough.current === newest) readThrough.current = previous
      })
    }
    markLatest()
    document.addEventListener("visibilitychange", markLatest)
    return () => document.removeEventListener("visibilitychange", markLatest)
  }, [expanded, id, newest, messageData, refreshList])

  useEffect(() => {
    if (draft.attempt === lastAttempt.current) return
    lastAttempt.current = draft.attempt
    if (draft.attempt) setPage(1)
  }, [draft.attempt])

  useEffect(() => {
    if (draft.sent?.id === lastSent.current) return
    lastSent.current = draft.sent?.id
    void refreshThread()
    if (page === 1) void refreshHistory()
    else setPage(1)
  }, [draft.sent?.id, page, refreshHistory, refreshThread])

  const chooseQuote = (message: ThreadMessage) => {
    if (draft.sending) return
    onDraftChange({
      quote: { id: message.id, sender_name: message.sender_name, excerpt: message.content.trim().replace(/\s+/g, " ").slice(0, 180) },
    })
    input.current?.focus()
  }

  const toggleForward = (message: ThreadMessage) => {
    setSelection((items) => {
      if (items.some(({ id }) => id === message.id)) return items.filter(({ id }) => id !== message.id)
      return items.length < forwardLimit ? [...items, message] : items
    })
  }

  const ticket = current?.ticket
  const forwarding = Boolean(current && selection.length)
  const displayHeader = (
    <div className="account-messages__detail-heading">
      <div className={`account-messages__panel-heading${forwarding ? " account-messages__panel-heading--selecting" : ""}`}>
        <bdi className="account-messages__counterpart" title={current?.counterpart}>{current?.counterpart}</bdi>
        <h2 className="account-messages__subject ui-scroll-text-trigger" tabIndex={-1} ref={heading}>
          <ScrollText text={current?.subject ?? "گفتگو"} />
        </h2>
        <div className="account-messages__heading-actions">
          <TicketBadge ticket={ticket} number={id} />
          <div className="account-messages__detail-actions">
            {current && forwarding && <GlassButton size="sm" color="primary" className="account-messages__forward"
              aria-label={`ارسال به دیگری (${formatCoins(selection.length)})`}
              onPress={() => onForward(current, selection)}>ارسال به دیگری</GlassButton>}
            <GlassButton type="button" size="sm" color="danger" isIconOnly className="account-messages__close"
              aria-label="بستن گفتگو" onPress={onBack}>
              <MessagingIcon name="close" />
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  )
  return (
    <GlassCard size="md" className={`account-messages__detail ui-fade-in${expanded ? " account-messages__detail--expanded" : ""}`}
      heading={displayHeader}
      footer={thread.data?.can_reply && (
        <ReplyComposer inputRef={input} draft={draft} expanded={expanded} onExpand={setExpanded}
          reopensTicket={ticket?.status === "resolved" && ticket.assignee === undefined}
          onChange={(content) => onDraftChange({ content })}
          onClearQuote={() => { onDraftChange({ quote: undefined }); input.current?.focus() }}
          onSend={() => { setExpanded(false); onReply() }} />
      )}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Give keyboard users direct access to the scrolling history. */}
      <div className="account-messages__timeline custom-scrollbar" ref={timeline.viewport} onScroll={timeline.onScroll} hidden={expanded} role="region" aria-label="تاریخچهٔ گفتگو" tabIndex={0}>
        {thread.data && <TicketControls thread={thread.data} userId={userId}
          onUpdated={(entry) => {
            refreshList()
            if (!heading.current) return
            thread.setData(entry)
            void refreshThread()
          }} onConflict={() => { void refreshThread(); refreshList() }} />}
        <AccountStatus loading={thread.loading && !thread.data} error={thread.error} retry={refreshThread} />
        <AccountStatus loading={messages.loading && !messageData && Boolean(thread.data)}
          error={messages.error && !thread.error ? messages.error : ""} retry={refreshHistory} />
        {(messageData || sent || attempt) && <MessageHistory messages={history} userId={userId} attempt={attempt}
          onReply={thread.data?.can_reply ? chooseQuote : undefined} replyDisabled={draft.sending}
          selection={thread.data ? { items: selection, toggle: toggleForward, max: forwardLimit } : undefined} />}
      </div>
      {!expanded && <PageControls data={messageData} page={page} onPage={setPage} />}
    </GlassCard>
  )
}
