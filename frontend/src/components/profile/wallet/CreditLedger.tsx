import type { ReactNode } from "react"
import { GlassTable, type GlassTableColumn } from "@/components/ui/tables/GlassTable"
import type { LedgerEntry } from "@/types/account"
import { formatAccountDate, formatCoins } from "../shared/accountFormat"

const ledgerLabels: Record<string, string> = {
  earned: "افزایش اعتبار", spent: "مصرف اعتبار", bonus: "هدیه", refund: "بازگشت اعتبار",
  adjustment: "اصلاح موجودی", grant: "سهمیه", expiry: "انقضای اعتبار", reserve: "رزرو برای پردازش",
  settle: "تسویه پردازش",
}
const bucketLabels: Record<string, string> = { monthly: "ماهانه", permanent: "دائمی", shared: "اشتراکی" }
const descriptions: Record<string, string> = {
  email_verification: "تأیید ایمیل", platform: "سهمیه نقش سامانه",
  job_reservation: "رزرو برای کار", expired_job_reservation: "انقضای رزرو ماهانه",
}

const columns: GlassTableColumn<LedgerEntry>[] = [
  { key: "type", label: "نوع", render: (entry) => ledgerLabels[entry.transaction_type] || entry.transaction_type },
  { key: "amount", label: "مبلغ", render: (entry) => <bdi>{formatCoins(entry.amount)}</bdi> },
  { key: "bucket", label: "اعتبار", render: (entry) => bucketLabels[entry.bucket] || entry.bucket },
  {
    key: "description", label: "شرح", render: (entry) => descriptions[entry.description] ?? (
      entry.description.startsWith("group:") ? "سهمیه گروه" :
        entry.description.startsWith("monthly:") ? "پایان ماه" : entry.description
    ),
  },
  { key: "time", label: "زمان", render: (entry) => formatAccountDate(entry.created_at) },
]

export function CreditLedger({ entries, controls, footer, showEmpty = true }: {
  entries: LedgerEntry[]
  controls?: ReactNode
  footer?: ReactNode
  showEmpty?: boolean
}) {
  return (
    <GlassTable label="تراکنش‌ها" rows={entries} columns={columns} rowKey={(entry) => entry.id}
      controls={controls} footer={footer}
      empty={showEmpty && <p className="account-workspace__muted">تراکنشی ثبت نشده است.</p>} />
  )
}
