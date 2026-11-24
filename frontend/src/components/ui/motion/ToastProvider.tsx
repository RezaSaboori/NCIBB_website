import { AnimatePresence } from "framer-motion"
import { useCallback, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { MotionToast } from "./MotionToast"
import { useReducedMotionPreference } from "./useReducedMotionPreference"
import { ToastContext, type ToastFeedback, type ToastItem } from "./useToast"
import "./ToastProvider.css"

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const [announcement, setAnnouncement] = useState<ToastItem>()
  const nextId = useRef(0)
  const reducedMotion = useReducedMotionPreference()
  const notify = useCallback((feedback: ToastFeedback) => {
    const item = { ...feedback, id: ++nextId.current }
    setItems((current) => [...current, item])
    setAnnouncement(item)
  }, [])
  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {createPortal(
        <>
          <div className="sr-only" role="status" aria-atomic="true">
            {announcement?.tone === "success" && <span key={announcement.id}>{announcement.message}</span>}
          </div>
          <div className="sr-only" role="alert" aria-atomic="true">
            {announcement?.tone === "error" && <span key={announcement.id}>{announcement.message}</span>}
          </div>
          <div className="ui-toasts">
            <ul className="ui-toasts__list" aria-label="اعلان‌ها">
              <AnimatePresence mode={reducedMotion ? "sync" : "popLayout"}>
                {items.map((item) => (
                  <MotionToast key={item.id} item={item} reducedMotion={reducedMotion} onDismiss={dismiss} />
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
