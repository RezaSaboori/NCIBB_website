import { useEffect, useRef, useState } from "react"
import { useToast } from "@/components/ui/motion/useToast"
import { accountError } from "@/dataset_services/accountApi"

type ProfileSection = "basic" | "professional"
export type ProfileSavePhase = "saving" | "saved" | "failed"
type SaveFeedback = { section: ProfileSection; phase: ProfileSavePhase }

export function useProfileSaveFeedback() {
  const announce = useToast()
  const pending = useRef(false)
  const [feedback, setFeedback] = useState<SaveFeedback>()

  useEffect(() => {
    if (feedback?.phase !== "saved") return
    const timeout = window.setTimeout(() => setFeedback(undefined), 1600)
    return () => window.clearTimeout(timeout)
  }, [feedback])

  const save = async (section: ProfileSection, persist: () => Promise<unknown>) => {
    if (pending.current) return false
    pending.current = true
    setFeedback({ section, phase: "saving" })
    try {
      await persist()
      setFeedback({ section, phase: "saved" })
      announce({ tone: "success", message: "تغییرات ذخیره شد." })
      return true
    } catch (error) {
      setFeedback({ section, phase: "failed" })
      announce({ tone: "error", message: accountError(error) })
      return false
    } finally {
      pending.current = false
    }
  }

  function clearFailure(section: ProfileSection) {
    setFeedback((current) => current?.section === section && current.phase === "failed" ? undefined : current)
  }

  return { feedback, save, clearFailure }
}
