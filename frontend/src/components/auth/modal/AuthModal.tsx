import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Tabs,
  Tab,
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

export const AuthModal = ({ isOpen, onOpenChange }: AuthModalProps) => {
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
                className="auth-modal-close-btn"
                aria-label="بستن"
              >
                <Icon icon="mdi:close" width={18} />
              </Button>
            </ModalHeader>
            <ModalBody className="auth-modal-body">
              <Tabs
                aria-label="Authentication Tabs"
                classNames={{
                  tabList: "glass auth-modal-tablist",
                  cursor: "blue-glass auth-modal-tab-cursor",
                  tab: "auth-modal-tab",
                }}
              >
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