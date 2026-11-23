import { useCallback, useState } from "react"
import { Button } from "@heroui/react"
import { accountApi } from "@/dataset_services/accountApi"
import type { LedgerEntry, Page, Thread } from "@/types/account"
import { MessageHistory } from "../messages/MessageHistory"
import { formatAccountDate } from "../shared/accountFormat"
import { AccountStatus } from "../shared/AccountStatus"
import { PageControls } from "../shared/PageControls"
import { useAccountQuery } from "../shared/useAccountQuery"
import { CreditLedger } from "../wallet/CreditLedger"

const auditLabels: Record<string, string> = {
  roles_changed: "تغییر نقش‌ها", account_status_changed: "تغییر وضعیت حساب",
  conversation_reviewed: "مشاهده گفتگو توسط مدیر", email_verified: "تأیید ایمیل",
  admin_bootstrapped: "فعال‌سازی دسترسی مدیر", group_membership_changed: "تغییر عضویت گروه",
  group_spending_changed: "تغییر دسترسی به کیف پول گروه", mentor_assigned: "تعیین استاد",
  mentor_removed: "حذف ارتباط با استاد",
}

function useDetailPage<T>(load: (page: number) => Promise<Page<T>>) {
  const [page, setPage] = useState(1)
  const query = useAccountQuery(useCallback(() => load(page), [load, page]))
  return { ...query, page, setPage }
}

export function UserProjectsSection({ id }: { id: number }) {
  const query = useDetailPage(useCallback((page) => accountApi.projects(id, page), [id]))
  return (
    <div className="account-workspace__stack">
      <AccountStatus loading={query.loading} error={query.error} retry={query.refresh} />
      {query.data?.results.length === 0 && <p>پروژه‌ای ثبت نشده است.</p>}
      {query.data && <ul className="account-workspace__rows">
        {query.data.results.map((project) => (
          <li key={`${project.service}:${project.pk}`}><strong>{project.name}</strong>
            <span>{project.service === "datasaz" ? "داده‌ساز" : "پروژه"} · {project.status} · {formatAccountDate(project.updated_at)}</span>
          </li>
        ))}
      </ul>}
      <PageControls data={query.data} page={query.page} onPage={query.setPage} />
    </div>
  )
}

function ReviewThread({ id, thread, close }: { id: number; thread: Thread; close: () => void }) {
  const query = useDetailPage(useCallback((page) => accountApi.userThreadMessages(id, thread.id, page), [id, thread.id]))
  return (
    <div className="account-workspace__stack">
      <div className="account-workspace__toolbar"><h3>{thread.subject}</h3><Button size="sm" variant="flat" onPress={close}>فهرست گفتگوها</Button></div>
      <AccountStatus loading={query.loading} error={query.error} retry={query.refresh} />
      {query.data && <MessageHistory messages={query.data.results} userId={id} />}
      <PageControls data={query.data} page={query.page} onPage={query.setPage} />
    </div>
  )
}

export function UserMessagesSection({ id }: { id: number }) {
  const [thread, setThread] = useState<Thread>()
  const query = useDetailPage(useCallback((page) => accountApi.userThreads(id, page), [id]))
  if (thread) return <ReviewThread id={id} thread={thread} close={() => setThread(undefined)} />
  return (
    <div className="account-workspace__stack">
      <AccountStatus loading={query.loading} error={query.error} retry={query.refresh} />
      {query.data?.results.length === 0 && <p>گفتگویی ثبت نشده است.</p>}
      {query.data?.results.map((item) => <button key={item.id} type="button" className="account-messages__thread" onClick={() => setThread(item)}>
        <strong>{item.subject}</strong><span>{item.counterpart} · {formatAccountDate(item.updated_at)}</span>
      </button>)}
      <PageControls data={query.data} page={query.page} onPage={query.setPage} />
    </div>
  )
}

export function UserLedgerSection({ id, revision }: { id: number; revision: number }) {
  const loadHistory = useCallback((page: number) => accountApi.userCreditHistory(id, page), [id])
  return <UserLedgerPage key={revision} load={loadHistory} />
}

function UserLedgerPage({ load }: { load: (page: number) => Promise<Page<LedgerEntry>> }) {
  const query = useDetailPage(load)
  return (
    <div className="account-workspace__stack">
      <AccountStatus loading={query.loading} error={query.error} retry={query.refresh} />
      {query.data && <CreditLedger entries={query.data.results} />}
      <PageControls data={query.data} page={query.page} onPage={query.setPage} />
    </div>
  )
}

export function UserAuditSection({ id }: { id: number }) {
  const query = useDetailPage(useCallback((page) => accountApi.userAudit(id, page), [id]))
  return (
    <div className="account-workspace__stack">
      <AccountStatus loading={query.loading} error={query.error} retry={query.refresh} />
      {query.data?.results.length === 0 && <p>رویدادی ثبت نشده است.</p>}
      {query.data && <ul className="account-workspace__rows">
        {query.data.results.map((entry) => (
          <li key={entry.id}><strong>{auditLabels[entry.action] || entry.action}</strong>
            <span>{entry.actor_name || "سامانه"} · {formatAccountDate(entry.created_at)}</span>
          </li>
        ))}
      </ul>}
      <PageControls data={query.data} page={query.page} onPage={query.setPage} />
    </div>
  )
}
