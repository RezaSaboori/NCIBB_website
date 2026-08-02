import { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from "@heroui/react"
import { Icon } from "@iconify/react"
import LoginForm from "../LoginForm"
import RegisterForm from "../RegisterForm"
import "./modal.css"
import "../../../styles/glass.css"

interface AuthModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

type AuthTab = "login" | "signup"

export const AuthModal = ({ isOpen, onOpenChange }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<AuthTab>("login")

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      hideCloseButton
      classNames={{
        wrapper: "modal-wrapper",
        base: "glass-transparent auth-modal-panel",
      }}
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="auth-modal-header">
              <span className="auth-modal-title">ورود یا ثبت نام</span>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={onClose}
                className="red-glass auth-modal-close-btn"
                aria-label="بستن"
              >
                <Icon icon="mdi:close" width={18} />
              </Button>
            </ModalHeader>
            <ModalBody className="auth-modal-body">
              {/* Custom pill tab bar — same pattern as header nav */}
              <div className="auth-modal-tablist glass" role="tablist" aria-label="Authentication Tabs">
                <button
                  role="tab"
                  aria-selected={activeTab === "login"}
                  className={`auth-modal-tab${activeTab === "login" ? " auth-modal-tab--active blue-glass" : ""}`}
                  onClick={() => setActiveTab("login")}
                  type="button"
                >
                  ورود
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === "signup"}
                  className={`auth-modal-tab${activeTab === "signup" ? " auth-modal-tab--active blue-glass" : ""}`}
                  onClick={() => setActiveTab("signup")}
                  type="button"
                >
                  ثبت نام
                </button>
              </div>

              {/* Tab panels */}
              <div role="tabpanel">
                {activeTab === "login" ? (
                  <LoginForm onLoginSuccess={onClose} />
                ) : (
                  <RegisterForm onRegisterSuccess={onClose} />
                )}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}