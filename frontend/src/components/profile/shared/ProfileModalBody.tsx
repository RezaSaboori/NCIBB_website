import { ModalBody } from "@heroui/react"
import { useLayoutEffect, useRef, type Key, type ReactNode } from "react"
import { useSurfaceReveal } from "@/components/ui/motion/useSurfaceReveal"

export function ProfileModalBody({ children, contentKey, resize, pending, estimatedBodySize }: {
  children: ReactNode
  contentKey?: Key
  resize: boolean
  pending: boolean
  estimatedBodySize?: string
}) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const { frameRef, contentRef } = useSurfaceReveal({ resize, pending, contentKey })

  useLayoutEffect(() => {
    if (contentKey !== undefined && bodyRef.current) bodyRef.current.scrollTop = 0
  }, [contentKey])

  return (
    <ModalBody ref={bodyRef} aria-busy={pending || undefined}>
      <div ref={frameRef}>
        <div ref={contentRef} className="profile-modal__content ui-optical-content"
          style={pending ? { minBlockSize: estimatedBodySize } : undefined}>
          {children}
        </div>
      </div>
    </ModalBody>
  )
}
