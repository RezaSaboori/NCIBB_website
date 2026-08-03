import React from "react"
// ts-expect-error JS module without types
import CompletionCard from "../CompletionCard"
// ts-expect-error JS module without types
import ActivityLog from "../ActivityLog"

interface DashboardTabProps {
  completion: any
  userId: string
  onRefresh: () => void
}

const DashboardTab: React.FC<DashboardTabProps> = ({ completion, userId, onRefresh }) => (
  <div className="space-y-6">
    <CompletionCard data={completion} onRefresh={onRefresh} />
    <ActivityLog userId={userId} />
  </div>
)

export default DashboardTab