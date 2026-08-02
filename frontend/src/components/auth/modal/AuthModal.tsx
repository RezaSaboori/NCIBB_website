import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Tabs,
  Tab,
} from "@heroui/react"
import LoginForm from "../LoginForm"
import RegisterForm from "../RegisterForm"
import "./modal.css"
import "../../../styles/glass.css"

interface AuthModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const AuthModal = ({ isOpen, onOpenChange }: AuthModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      classNames={{
        wrapper: "modal-wrapper",
        base: "glass-transparent auth-modal-panel",
        closeButton: "red-glass auth-modal-close-btn",
      }}
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="auth-modal-header">
              ورود یا ثبت نام
            </ModalHeader>
            <ModalBody className="auth-modal-body">
              <Tabs aria-label="Authentication Tabs">
                <Tab key="login" title="ورود">
                  <LoginForm onLoginSuccess={onClose} />
                </Tab>
                <Tab key="signup" title="ثبت نام">
                  <RegisterForm onRegisterSuccess={onClose} />
                </Tab>
              </Tabs>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}