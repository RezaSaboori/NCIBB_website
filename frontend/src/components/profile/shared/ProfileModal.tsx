import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, type ModalProps } from "@heroui/react"
import type { ReactNode, Ref } from "react"
import { GlassButton } from "@/components/ui/GlassButton"
import { useModalContentSize } from "./useModalContentSize"
import "./ProfileModal.css"

type ProfileModalProps = Pick<ModalProps, "isOpen" | "onOpenChange" | "onClose" | "size"> & {
  title: string
  children: ReactNode
  footer?: ReactNode
  animateSize?: boolean
  headerNavigationRef?: Ref<HTMLDivElement>
}

function AnimatedBody({ children }: { children: ReactNode }) {
  const { wrapperRef, contentRef } = useModalContentSize()

  return (
    <div className="profile-modal__size" ref={wrapperRef}>
      <div className="profile-modal__content" ref={contentRef}>{children}</div>
    </div>
  )
}

export function ProfileModal({ title, children, footer, animateSize, headerNavigationRef, ...props }: ProfileModalProps) {
  return (
    <Modal {...props} backdrop="blur" placement="center" scrollBehavior="inside" hideCloseButton
      classNames={{
        wrapper: "profile-modal__viewport",
        backdrop: "profile-modal__backdrop",
        base: "glass-transparent profile-modal",
        header: "profile-modal__title",
        body: "profile-modal__body",
        footer: "profile-modal__footer",
      }}>
      <ModalContent dir="rtl" className={headerNavigationRef ? "profile-modal--with-navigation" : undefined}>
        {(onClose) => (
          <>
            <div className="profile-modal__header">
              <ModalHeader><h2>{title}</h2></ModalHeader>
              <GlassButton type="button" size="sm" color="danger" isIconOnly className="profile-modal__close" aria-label="بستن" onPress={onClose}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </GlassButton>
              {headerNavigationRef && <div className="profile-modal__navigation" ref={headerNavigationRef} />}
            </div>
            <ModalBody>{animateSize ? <AnimatedBody>{children}</AnimatedBody> : children}</ModalBody>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
