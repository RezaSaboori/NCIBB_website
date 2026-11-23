import { useCallback, useEffect, useState, type FormEvent } from "react"
import { Button } from "@heroui/react"
import { Icon } from "@iconify/react"
import { accountApi, accountError } from "@/dataset_services/accountApi"
import type { Thread, ThreadMessage } from "@/types/account"
import { AccountStatus } from "../shared/AccountStatus"
import { PageControls } from "../shared/PageControls"
import { formatAccountDate, formatCoins } from "../shared/accountFormat"
import { useAccountQuery } from "../shared/useAccountQuery"
import { ComposeDialog } from "./ComposeDialog"
import { MessageHistory } from "./MessageHistory"

export default function MessagesTab({ userId, queue = false }: { userId: number; queue?: boolean }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [active, setActive] = useState<Thread>()
  const [messagePage, setMessagePage] = useState(1)
  const [composeMode, setComposeMode] = useState<"compose" | "forward">()
  const [selected, setSelected] = useState<ThreadMessage[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const list = useAccountQuery(useCallback(() => accountApi.threads(page, queue ? "support_queue" : undefined, search), [page, queue, search]))
  const activeId = active?.id
  const messages = useAccountQuery(useCallback(() => activeId ? accountApi.threadMessages(activeId, messagePage) : null, [activeId, messagePage]))
  const thread = useAccountQuery(useCallback(() => activeId ? accountApi.thread(activeId) : null, [activeId]))
  const latest = messagePage === 1 ? messages.data?.results[0]?.id : undefined
  const refreshList = list.refresh

  useEffect(() => {
    if (!activeId || !latest) return
    void accountApi.markRead(activeId, latest).then(refreshList).catch(() => undefined)
  }, [activeId, latest, refreshList])

  const open = (item?: Thread) => {
    setActive(item)
    setSelected([])
    setMessagePage(1)
    setDraft("")
    setError("")
  }

  const reply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeId || !draft.trim()) return
    setSending(true)
    setError("")
    try {
      await accountApi.reply(activeId, draft.trim())
      setDraft("")
      if (messagePage === 1) void messages.refresh()
      else setMessagePage(1)
      void list.refresh()
    } catch (error) {
      setError(accountError(error))
    } finally {
      setSending(false)
    }
  }

  const toggleMessage = (message: ThreadMessage) => {
    setSelected((items) => items.some((item) => item.id === message.id)
      ? items.filter((item) => item.id !== message.id)
      : items.length < 10 ? [...items, message] : items)
  }

  return (
    <div className="account-workspace__stack">
      <div className="account-workspace__toolbar">
        <h1>{queue ? "صف پشتیبانی" : "پیام‌ها"}</h1>
        <Button color="primary" onPress={() => setComposeMode("compose")} startContent={<Icon icon="tabler:message-plus" />}>گفتگوی جدید</Button>
      </div>
      <div className={`account-messages${active ? " account-messages--active" : ""}`}>
        <section className="account-workspace__panel account-messages__list glass">
          <label className="account-workspace__form">جستجو در موضوع گفتگو
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} />
          </label>
          <AccountStatus loading={list.loading} error={list.error} retry={list.refresh} />
          {list.data?.results.length === 0 && <p className="account-workspace__muted">گفتگویی یافت نشد.</p>}
          {list.data?.results.map((item) => (
            <button type="button" className="account-messages__thread" aria-pressed={active?.id === item.id} key={item.id}
              onClick={() => open(item)}>
              <span className="account-workspace__toolbar"><strong>{item.subject}</strong>
                {item.unread_count > 0 && <span className="account-messages__unread" aria-label="پیام خوانده‌نشده">{formatCoins(item.unread_count)}</span>}
              </span>
              <span>{item.counterpart} · {formatAccountDate(item.updated_at)}</span>
              <span className="account-messages__preview">{item.preview}</span>
            </button>
          ))}
          <PageControls data={list.data} page={page} onPage={setPage} />
        </section>
        <section className="account-workspace__panel account-messages__detail glass">
          {!active ? <p className="account-workspace__muted">یک گفتگو را از فهرست انتخاب کنید.</p> : (
            <>
              <Button className="account-messages__back" size="sm" variant="flat" onPress={() => open()}>بازگشت به گفتگوها</Button>
              <div className="account-workspace__toolbar">
                <div><h2>{active.subject}</h2><span className="account-workspace__muted">{active.counterpart}</span></div>
                {!!selected.length && (
                  <Button size="sm" variant="flat" onPress={() => setComposeMode("forward")}>ارسال مجدد ({formatCoins(selected.length)})</Button>
                )}
              </div>
              <AccountStatus loading={messages.loading} error={messages.error || thread.error} retry={messages.refresh} />
              {messages.data && <MessageHistory messages={messages.data.results} userId={userId} selected={selected} toggle={toggleMessage} />}
              <PageControls data={messages.data} page={messagePage} onPage={setMessagePage} />
              {thread.data?.can_reply && <form className="account-workspace__form" onSubmit={reply}>
                <label>پاسخ<textarea maxLength={6000} rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} /></label>
                <AccountStatus error={error} />
                <Button className="account-workspace__submit" type="submit" color="primary" isDisabled={!draft.trim()} isLoading={sending}>ارسال پاسخ</Button>
              </form>}
            </>
          )}
        </section>
      </div>
      {composeMode && (
        <ComposeDialog source={composeMode === "forward" ? active : undefined} selected={selected}
          onClose={() => setComposeMode(undefined)} onSent={(item) => {
            setComposeMode(undefined)
            if (queue && item.route !== "support_queue") {
              open()
            } else open(item)
            setPage(1)
            void list.refresh()
          }} />
      )}
    </div>
  )
}
