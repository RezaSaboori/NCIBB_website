import { Icon, type IconifyIcon } from "@iconify/react"
import { Link } from "react-router-dom"
import { GlassCard } from "@/components/ui/GlassCard"
import { formatCoins } from "../shared/accountFormat"

interface DashboardMetricProps {
  label: string
  value?: string | number
  icon: string | IconifyIcon
  action?: { to: string; label: string; primary?: boolean }
}

export function DashboardMetric({ label, value, icon, action }: DashboardMetricProps) {
  return (
    <GlassCard size="md" className="account-workspace__metric"
      heading={<><Icon icon={icon} width={22} aria-hidden /><h3>{label}</h3></>}
      footer={action && <Link className={`ui-glass-button ${action.primary ? "blue-glass" : "glass"}`} to={action.to}>{action.label}</Link>}>
      <strong>{value === undefined ? "—" : formatCoins(value)}</strong>
    </GlassCard>
  )
}
