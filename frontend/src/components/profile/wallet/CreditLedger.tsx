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

export function CreditLedger({ entries }: { entries: LedgerEntry[] }) {
  if (!entries.length) return <p className="account-workspace__muted">تراکنشی ثبت نشده است.</p>
  return (
    <div className="account-workspace__table-wrap">
      <table className="account-workspace__table">
        <thead><tr><th>نوع</th><th>مبلغ</th><th>اعتبار</th><th>شرح</th><th>زمان</th></tr></thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{ledgerLabels[entry.transaction_type] || entry.transaction_type}</td>
              <td><bdi>{formatCoins(entry.amount)}</bdi></td>
              <td>{bucketLabels[entry.bucket] || entry.bucket}</td>
              <td>{descriptions[entry.description] ?? (
                entry.description.startsWith("group:") ? "سهمیه گروه" :
                  entry.description.startsWith("monthly:") ? "پایان ماه" : entry.description
              )}</td>
              <td>{formatAccountDate(entry.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
