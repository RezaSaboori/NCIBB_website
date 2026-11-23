import { GlassButton } from "@/components/ui/GlassButton"
import { GlassTable, type GlassTableColumn } from "@/components/ui/tables/GlassTable"
import { useCallback, useState } from "react"
import { accountApi } from "@/dataset_services/accountApi"
import type { AdminProject, AuditEvent, LedgerEntry, Page, Thread } from "@/types/account"
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

const projectStatusLabels: Record<string, string> = {
  draft: "پیش‌نویس", step1_complete: "مرحله ۱ تکمیل شده", step2_complete: "مرحله ۲ تکمیل شده",
  processing: "در حال پردازش", active: "فعال", completed: "تکمیل شده", archived: "بایگانی شده",
}

const projectColumns: GlassTableColumn<AdminProject>[] = [
  { key: "name", label: "نام پروژه", render: (project) => <strong><bdi>{project.name}</bdi></strong> },
  { key: "service", label: "سرویس", render: (project) => project.service === "datasaz" ? "داده‌ساز" : "پروژه" },
  { key: "status", label: "وضعیت", render: (project) => projectStatusLabels[project.status] ?? project.status },
  { key: "updated", label: "آخرین تغییر", render: (project) => formatAccountDate(project.updated_at) },
]

const auditColumns: GlassTableColumn<AuditEvent>[] = [
  { key: "action", label: "رویداد", render: (entry) => auditLabels[entry.action] ?? entry.action },
  { key: "actor", label: "انجام‌دهنده", render: (entry) => <bdi>{entry.actor_name || "سامانه"}</bdi> },
  { key: "created", label: "زمان", render: (entry) => formatAccountDate(entry.created_at) },
]

function useDetailPage<T>(load: (page: number) => Promise<Page<T>>) {
  const [page, setPage] = useState(1)
  const query = useAccountQuery(useCallback(() => load(page), [load, page]))
  return { ...query, page, setPage }
}

export function UserProjectsSection({ id }: { id: number }) {
  const query = useDetailPage(useCallback((page) => accountApi.projects(id, page), [id]))
  return (
    <GlassTable label="پروژه‌های کاربر" columns={projectColumns} rows={query.data?.results ?? []} rowKey={(project) => `${project.service}:${project.pk}`}
      controls={<AccountStatus loading={query.loading} error={query.error} retry={query.refresh} />}
      footer={<PageControls data={query.data} page={query.page} onPage={query.setPage} />}
      empty={query.data && <p>پروژه‌ای ثبت نشده است.</p>} />
  )
}

function ReviewThread({ id, thread, close }: { id: number; thread: Thread; close: () => void }) {
  const query = useDetailPage(useCallback((page) => accountApi.userThreadMessages(id, thread.id, page), [id, thread.id]))
  return (
    <div className="account-workspace__stack">
      <div className="account-workspace__toolbar"><h3>{thread.subject}</h3><GlassButton size="sm" variant="flat" onPress={close}>فهرست گفتگوها</GlassButton></div>
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
      {query.data?.results.map((item) => <button key={item.id} type="button" className="glass account-messages__thread" onClick={() => setThread(item)}>
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
      <CreditLedger entries={query.data?.results ?? []}
        controls={<AccountStatus loading={query.loading} error={query.error} retry={query.refresh} />}
        footer={<PageControls data={query.data} page={query.page} onPage={query.setPage} />}
        showEmpty={!!query.data} />
    </div>
  )
}

export function UserAuditSection({ id }: { id: number }) {
  const query = useDetailPage(useCallback((page) => accountApi.userAudit(id, page), [id]))
  return (
    <GlassTable label="رویدادهای کاربر" columns={auditColumns} rows={query.data?.results ?? []} rowKey={(entry) => entry.id}
      controls={<AccountStatus loading={query.loading} error={query.error} retry={query.refresh} />}
      footer={<PageControls data={query.data} page={query.page} onPage={query.setPage} />}
      empty={query.data && <p>رویدادی ثبت نشده است.</p>} />
  )
}
