import { GlassButton } from "@/components/ui/GlassButton"
import { Spinner } from "@heroui/react"

export function AccountStatus({ loading, error, retry }: { loading?: boolean; error?: string; retry?: () => void }) {
  if (error) return (
    <div className="account-workspace__status" role="alert">
      <span>{error}</span>
      {retry && <GlassButton size="sm" variant="flat" onPress={retry}>تلاش دوباره</GlassButton>}
    </div>
  )
  return loading ? <Spinner size="sm" label="در حال بارگذاری…" /> : null
}
