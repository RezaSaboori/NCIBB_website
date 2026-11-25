import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { Icon } from "@iconify/react"
import { GlassButton } from "@/components/ui/GlassButton"
import { useToast } from "@/components/ui/motion/useToast"
import { accountApi } from "@/dataset_services/accountApi"
import type { Thread, ThreadMessage } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { useAccountQuery } from "../shared/useAccountQuery"
import { ComposeDialog } from "./ComposeDialog"
import { ConversationDetail } from "./ConversationDetail"
import { ConversationList, type ConversationFilters } from "./ConversationList"
import { useConversationDrafts } from "./useConversationDrafts"
import { useMessagingRefresh } from "./useMessagingRefresh"

const emptyFilters: ConversationFilters = { search: "", status: "", owner: "" }

interface Composer {
  open: boolean
  key: number
  source?: Thread
  messages: ThreadMessage[]
}

export default function MessagesTab({ userId, queue = false }: { userId: number; queue?: boolean }) {
  const navigate = useNavigate()
  const { pathname, search, hash, state } = useLocation()
  const handoffId: unknown = state?.messagingThread
  const [active, setActive] = useState<{ id: number; thread?: Thread } | undefined>(() =>
    !queue && typeof handoffId === "number" && Number.isSafeInteger(handoffId) && handoffId > 0
      ? { id: handoffId } : undefined,
  )
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(emptyFilters)
  const [hadHistory, setHadHistory] = useState(false)
  const [composer, setComposer] = useState<Composer>()
  const listPane = useRef<HTMLDivElement>(null)
  const listScroll = useRef<HTMLDivElement>(null)
  const listScrollPosition = useRef<number>()
  const heading = useRef<HTMLHeadingElement>(null)
  const returnFocus = useRef<number>()
  const announce = useToast()

  const list = useAccountQuery(useCallback(() => accountApi.threads(
    page, queue ? "support_queue" : undefined, filters.search.trim(), filters.status || undefined, filters.owner || undefined,
  ).then(
    (data) => ({ data, page, filters }),
    (error: unknown) => {
      if (page > 1 && axios.isAxiosError(error) && error.response?.status === 404) {
        return { data: undefined, page, filters }
      }
      throw error
    },
  ), [page, queue, filters]))
  const result = list.data?.page === page && list.data.filters === filters ? list.data : undefined
  const data = result?.data
  const filtered = Boolean(filters.search.trim() || filters.status || filters.owner)
  const showList = filtered || (data ? data.count > 0 : hadHistory)
  const activeId = active?.id
  const currentRefresh = useRef(list.refresh)

  useMessagingRefresh(list.refreshInBackground)
  useLayoutEffect(() => { currentRefresh.current = list.refresh }, [list.refresh])
  const refreshList = useCallback(() => { void currentRefresh.current() }, [])
  const drafts = useConversationDrafts(refreshList)

  useEffect(() => {
    if (!queue && typeof handoffId === "number") navigate({ pathname, search, hash }, { replace: true, state: null })
  }, [handoffId, queue, pathname, search, hash, navigate])

  useEffect(() => {
    if (result && !data) setPage(1)
    if (data && !filtered) setHadHistory(data.count > 0)
  }, [result, data, filtered])

  useLayoutEffect(() => {
    if (activeId !== undefined || returnFocus.current === undefined) return
    if (listScroll.current && listScrollPosition.current !== undefined) {
      listScroll.current.scrollTop = listScrollPosition.current
    }
    const row = listPane.current?.querySelector<HTMLButtonElement>(`[data-thread-id="${returnFocus.current}"]`)
    const target = row ?? listPane.current?.querySelector("h2") ?? heading.current
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: "nearest" })
    returnFocus.current = undefined
    listScrollPosition.current = undefined
  }, [activeId])

  const openConversation = (thread: Thread) => {
    listScrollPosition.current = window.matchMedia("(max-width: 760px)").matches ? listScroll.current?.scrollTop : undefined
    setActive({ id: thread.id, thread })
  }

  const openComposer = (source?: Thread, messages: ThreadMessage[] = []) => {
    setComposer((current) => ({ open: true, key: (current?.key ?? 0) + 1, source, messages }))
  }
  const closeComposer = () => setComposer((current) => current && { ...current, open: false })

  const onSent = (thread: Thread) => {
    closeComposer()
    announce({
      tone: "success",
      message: thread.ticket ? "تیکت ایجاد شد." : composer?.source ? "پیام‌ها ارسال شد." : "گفتگو ایجاد شد.",
    })
    if (queue && thread.route !== "support_queue") {
      navigate("/profile?tab=messages", { state: { messagingThread: thread.id } })
      return
    }
    setActive({ id: thread.id, thread })
    if (page !== 1 || filters !== emptyFilters) {
      setPage(1)
      setFilters(emptyFilters)
    } else {
      refreshList()
    }
  }

  const newConversation = (
    <GlassButton color="primary" size={showList ? "sm" : undefined} onPress={() => openComposer()}
      startContent={<Icon icon="tabler:message-plus" />}>گفتگوی جدید</GlassButton>
  )

  return (
    <div className="account-workspace__stack">
      <div className="account-messages__workspace-heading">
        <h1 ref={heading} tabIndex={-1}>{queue ? "صف پشتیبانی" : "پیام‌ها"}</h1>
        {!showList && newConversation}
      </div>
      {!showList && <AccountStatus loading={list.loading || Boolean(result && !data)} error={list.error} retry={refreshList} />}
      {!showList && !list.loading && !list.error && data?.count === 0 && activeId === undefined && (
        <p role="status" className="account-workspace__muted">
          {queue ? "هنوز تیکتی در صف پشتیبانی ثبت نشده است." : "هنوز گفتگویی ندارید."}
        </p>
      )}
      {(showList || activeId !== undefined) && (
        <div className={`account-messages${activeId !== undefined ? " account-messages--active" : ""}${showList ? " account-messages--with-list" : ""}`}>
          {showList && <ConversationList queue={queue} userId={userId} newConversation={newConversation}
            activeId={activeId} page={page} filters={filters} data={data}
            loading={list.loading || Boolean(result && !data)} error={list.error} listRef={listPane} scrollRef={listScroll}
            onPage={setPage} onRetry={refreshList} onSelect={openConversation}
            onChange={(next) => { setPage(1); setFilters(next) }} />}
          {activeId !== undefined && (
            <ConversationDetail key={activeId} id={activeId} userId={userId}
              initial={data?.results.find(({ id }) => id === activeId) ?? active?.thread}
              draft={drafts.get(activeId)} onDraftChange={(changes) => drafts.update(activeId, changes)}
              onReply={() => void drafts.send(activeId)} onForward={openComposer} refreshList={refreshList}
              onBack={() => { returnFocus.current = activeId; setActive(undefined) }} />
          )}
        </div>
      )}
      {composer && <ComposeDialog key={composer.key} isOpen={composer.open} source={composer.source} userId={userId}
        selected={composer.messages} onClose={closeComposer} onSent={onSent} />}
    </div>
  )
}
