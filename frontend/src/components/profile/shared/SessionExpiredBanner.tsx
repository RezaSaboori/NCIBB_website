import React, { useState } from "react"
import { Alert, Button } from "@heroui/react"
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
      <div className="max-w-4xl mx-auto p-6">
        <Alert
          color="danger"
          title="دسترسی محدود"
          description={message}
          endContent={
            <Button
              size="sm"
              variant="flat"
              onPress={() => setIsAuthModalOpen(true)}
            >
              ورود به حساب
            </Button>
          }
        />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
      />
    </>
  )
}

export default SessionExpiredBanner