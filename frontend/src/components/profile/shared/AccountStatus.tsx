import { GlassButton } from "@/components/ui/GlassButton"
import { Spinner } from "@heroui/react"

export function AccountStatus({ loading, error, retry, holdsReveal }: { loading?: boolean; error?: string; retry?: () => void; holdsReveal?: boolean }) {
  if (error) return (
    <div className="account-workspace__status ui-fade-in" role="alert">
      <span>{error}</span>
      {retry && <GlassButton size="sm" variant="flat" onPress={retry}>تلاش دوباره</GlassButton>}
    </div>
  )
  return loading ? <Spinner data-motion-pending={holdsReveal || undefined} size="sm" label="در حال بارگذاری…" /> : null
}
