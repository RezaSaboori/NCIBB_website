import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react"
import "./modal.css"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const ForgotPasswordModal = ({
  isOpen,
  onOpenChange,
}: ForgotPasswordModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="modal-container"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Forgot Password</ModalHeader>
            <ModalBody>
              <p>
                Enter your email address and we&apos;ll send you a link to reset your
                password.
              </p>
              <Input
                radius="full"
                isRequired
                label="Email"
                placeholder="Enter your email"
                type="email"
                autoComplete="email"
                inputMode="email"
                classNames={{
                  inputWrapper:
                    "rounded-full bg-gray2 data-[hover=true]:bg-gray2 data-[focus=true]:bg-gray2 data-[disabled=true]:bg-gray2 data-[has-value=false]:bg-gray2 data-[filled=false]:bg-gray2",
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={onClose}>
                Send Reset Link
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
