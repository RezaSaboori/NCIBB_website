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
      className="glass-transparent modal-container"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <div className="p-2">
            <ModalHeader className="flex flex-col gap-1">
              ورود یا ثبت نام
            </ModalHeader>
            <ModalBody>
              <Tabs aria-label="Authentication Tabs">
                <Tab key="login" title="ورود">
                  <LoginForm onLoginSuccess={onClose} />
                </Tab>
                <Tab key="signup" title="ثبت نام">
                  <RegisterForm onRegisterSuccess={onClose} />
                </Tab>
              </Tabs>
            </ModalBody>
          </div>
        )}
      </ModalContent>
    </Modal>
  )
}