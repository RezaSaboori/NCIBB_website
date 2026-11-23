import type { ReactNode } from "react"
import { GlassCard } from "@/components/ui/GlassCard"
import "./ProfileDetailCards.css"

interface ProfileDetail {
  label: string
  value: ReactNode
  footer?: ReactNode
  fullWidthOnMobile?: boolean
}

export function ProfileDetailCards({ items }: { items: ProfileDetail[] }) {
  return (
    <div className="profile-detail-cards">
      {items.map(({ label, value, footer, fullWidthOnMobile }) => (
        <GlassCard key={label} size="sm" heading={<h3>{label}</h3>} footer={footer}
          className={fullWidthOnMobile ? "profile-detail-card profile-detail-card--wide-mobile" : "profile-detail-card"}>
          {value}
        </GlassCard>
      ))}
    </div>
  )
}
