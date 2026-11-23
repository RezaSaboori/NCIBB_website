import { Progress } from "@heroui/react"
import { GlassCard } from "@/components/ui/GlassCard"
import { formatCoins } from "./shared/accountFormat"

const fieldLabels = {
  first_name: "نام",
  last_name: "نام خانوادگی",
  job_title: "عنوان شغلی",
  company: "شرکت",
  city: "شهر",
  country: "کشور",
  profile_picture: "عکس پروفایل",
}

export default function CompletionCard({ data }) {
  if (!data) return null
  const { completion_percentage, missing_fields = [] } = data
  const missing = missing_fields.map(({ field, label }) => fieldLabels[field] || label)

  return (
    <GlassCard size="sm"
      heading={<div className="account-workspace__toolbar"><h2>تکمیل اطلاعات</h2><span>{formatCoins(completion_percentage)}٪</span></div>}
      footer={missing.length > 0 && <p className="account-workspace__muted">اطلاعات ناقص: {missing.join("، ")}</p>}>
      <Progress value={completion_percentage} color="primary" aria-label="درصد تکمیل اطلاعات" />
    </GlassCard>
  )
}
