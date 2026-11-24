import { createContext, useContext } from "react"

export type ToastFeedback = { message: string; tone: "success" | "error" }
export type ToastItem = ToastFeedback & { id: number }

export const ToastContext = createContext<(feedback: ToastFeedback) => void>(() => undefined)

export function useToast() {
  return useContext(ToastContext)
}
