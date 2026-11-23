import { Button } from "@heroui/react"
import type { Page } from "@/types/account"

export function PageControls({ data, page, onPage }: { data?: Page<unknown>; page: number; onPage: (page: number) => void }) {
  if (!data?.next && !data?.previous) return null
  return (
    <nav className="account-workspace__actions" aria-label="صفحه‌بندی">
      <Button size="sm" variant="flat" isDisabled={!data.previous} onPress={() => onPage(page - 1)}>قبلی</Button>
      <span>{new Intl.NumberFormat("fa-IR").format(page)}</span>
      <Button size="sm" variant="flat" isDisabled={!data.next} onPress={() => onPage(page + 1)}>بعدی</Button>
    </nav>
  )
}
