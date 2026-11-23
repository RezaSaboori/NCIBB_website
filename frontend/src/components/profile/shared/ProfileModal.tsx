import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, type ModalProps } from "@heroui/react"
import type { ReactNode } from "react"
import { useModalContentSize } from "./useModalContentSize"
import "./ProfileModal.css"

type ProfileModalProps = Pick<ModalProps, "isOpen" | "onOpenChange" | "onClose" | "size"> & {
  title: string
  children: ReactNode
  footer?: ReactNode
  animateSize?: boolean
}

function AnimatedBody({ children }: { children: ReactNode }) {
  const { wrapperRef, contentRef } = useModalContentSize()

  return (
    <div className="profile-modal__size" ref={wrapperRef}>
      <div className="profile-modal__content" ref={contentRef}>{children}</div>
    </div>
  )
}

export function ProfileModal({ title, children, footer, animateSize, ...props }: ProfileModalProps) {
  return (
    <Modal {...props} backdrop="blur" placement="center" scrollBehavior="inside" hideCloseButton
      classNames={{
        wrapper: "profile-modal__viewport",
        backdrop: "profile-modal__backdrop",
        base: "glass-transparent profile-modal",
        header: "profile-modal__header",
        body: "profile-modal__body",
        footer: "profile-modal__footer",
      }}>
      <ModalContent dir="rtl">
        {(onClose) => (
          <>
            <ModalHeader>
              <h2>{title}</h2>
              <Button type="button" size="sm" radius="full" isIconOnly className="glass profile-modal__close" aria-label="بستن" onPress={onClose}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </Button>
            </ModalHeader>
            <ModalBody>{animateSize ? <AnimatedBody>{children}</AnimatedBody> : children}</ModalBody>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
