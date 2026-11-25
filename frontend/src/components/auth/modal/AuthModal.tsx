import { useId, useState, type KeyboardEvent } from "react"
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

const authTabs: { key: AuthTab; label: string }[] = [
  { key: "login", label: "ورود" },
  { key: "signup", label: "ثبت نام" },
]

export const AuthModal = ({ isOpen, onOpenChange }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<AuthTab>("login")
  const id = useId()
  const moveTabFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: AuthTab
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight":
        next = activeTab === "login" ? "signup" : "login"
        break
      case "Home":
        next = "login"
        break
      case "End":
        next = "signup"
        break
      default:
        return
    }
    event.preventDefault()
    setActiveTab(next)
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-auth-tab="${next}"]`)?.focus()
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      scrollBehavior="inside"
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
              <div className="auth-modal-tablist glass-navigation glass-transparent" role="tablist" aria-label="ورود و ثبت نام" onKeyDown={moveTabFocus}>
                {authTabs.map(({ key, label }) => (
                  <button
                    key={key}
                    id={`${id}-${key}-tab`}
                    role="tab"
                    data-auth-tab={key}
                    aria-controls={`${id}-${key}-panel`}
                    aria-selected={activeTab === key}
                    tabIndex={activeTab === key ? 0 : -1}
                    className={`auth-modal-tab glass-navigation__item${activeTab === key ? " blue-glass-transparent" : ""}`}
                    onClick={() => setActiveTab(key)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div role="tabpanel" id={`${id}-login-panel`} aria-labelledby={`${id}-login-tab`} hidden={activeTab !== "login"}>
                {activeTab === "login" && <LoginForm onLoginSuccess={onClose} />}
              </div>
              <div role="tabpanel" id={`${id}-signup-panel`} aria-labelledby={`${id}-signup-tab`} hidden={activeTab !== "signup"}>
                {activeTab === "signup" && <RegisterForm onRegisterSuccess={onClose} />}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
