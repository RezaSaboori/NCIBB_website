import { Button, Spinner } from "@heroui/react"

export function AccountStatus({ loading, error, retry }: { loading?: boolean; error?: string; retry?: () => void }) {
  if (error) return (
    <div className="account-workspace__status" role="alert">
      <span>{error}</span>
      {retry && <Button size="sm" variant="flat" onPress={retry}>تلاش دوباره</Button>}
    </div>
  )
  return loading ? <Spinner size="sm" label="در حال بارگذاری…" /> : null
}
