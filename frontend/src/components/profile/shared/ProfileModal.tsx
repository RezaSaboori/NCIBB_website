import { Modal, ModalContent, ModalFooter, ModalHeader, type ModalProps } from "@heroui/react"
import type { CSSProperties, Key, ReactNode, Ref } from "react"
import { GlassButton } from "@/components/ui/GlassButton"
import { dialogResizeDuration } from "@/components/ui/motion/motionPresets"
import { useMotionVariants } from "@/components/ui/motion/useMotionVariants"
import { ProfileModalBody } from "./ProfileModalBody"
import "./ProfileModal.css"

type ProfileModalProps = Pick<ModalProps, "isOpen" | "onOpenChange" | "onClose" | "size"> & {
  title: string
  children: ReactNode
  footer?: ReactNode
  surface?: "glass" | "glass-transparent"
  animateSize?: boolean
  bodyKey?: Key
  contentPending?: boolean
  estimatedBodySize?: string
  headerNavigationRef?: Ref<HTMLDivElement>
}

const dialogTimingStyle = {
  "--motion-duration-surface": `${dialogResizeDuration}s`,
} as CSSProperties

export function ProfileModal({
  title, children, footer, surface = "glass-transparent", animateSize = false, bodyKey, contentPending = false, estimatedBodySize, headerNavigationRef, ...props
}: ProfileModalProps) {
  const variants = useMotionVariants("dialog")

  return (
    <Modal {...props} backdrop="opaque" placement="center" scrollBehavior="inside" hideCloseButton
      motionProps={{ variants, initial: false }}
      classNames={{
        wrapper: "profile-modal__viewport",
        backdrop: "profile-modal__backdrop",
        base: `${surface} profile-modal`,
        header: "profile-modal__title",
        body: "profile-modal__body",
        footer: "profile-modal__footer",
      }}>
      <ModalContent dir="rtl" data-motion-surface data-estimated-size={estimatedBodySize ? "true" : undefined}
        style={dialogTimingStyle} className={`ui-surface-enter${headerNavigationRef ? " profile-modal--with-navigation" : ""}`}>
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
            <ProfileModalBody resize={animateSize} pending={contentPending} contentKey={bodyKey} estimatedBodySize={estimatedBodySize}>
              {children}
            </ProfileModalBody>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
