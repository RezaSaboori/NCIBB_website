import { GlassButton } from "@/components/ui/GlassButton"
import React, { useState } from "react"
import { GlassCard } from "@/components/ui/GlassCard"
import { AuthModal } from "../../auth/modal/AuthModal"

interface SessionExpiredBannerProps {
  message?: string
}

const SessionExpiredBanner: React.FC<SessionExpiredBannerProps> = ({
  message = "لطفاً وارد حساب کاربری خود شوید.",
}) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <>
      <div className="page-content page-content--narrow account-workspace">
        <GlassCard heading={<h2>دسترسی محدود</h2>} footer={
          <GlassButton color="primary" onPress={() => setIsAuthModalOpen(true)}>ورود به حساب</GlassButton>
        }>
          <p>{message}</p>
        </GlassCard>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
      />
    </>
  )
}

export default SessionExpiredBanner