import { useEffect, useState } from "react"

import { preloadThemes } from "@/utils/theme/themePreloader"
import { useLoadingState } from "./useLoadingState"

const logoLoopDuration = 3500

export function useLandingEntrance(flow: boolean) {
  const [skipEntrance, setSkipEntrance] = useState(flow)
  const [startedAt] = useState(Date.now)
  const [fadeOut, setFadeOut] = useState(false)
  const { isLoading, totalProgress, updateProgress, handleError, finishLoading } = useLoadingState()
  const showEntrance = !flow && !skipEntrance

  useEffect(() => {
    if (flow) setSkipEntrance(true)
  }, [flow])

  useEffect(() => {
    if (!showEntrance) return

    void preloadThemes((progress) => updateProgress("theme", progress))
      .then(() => updateProgress("assets", 100))
      .catch(() => finishLoading())
  }, [finishLoading, showEntrance, updateProgress])

  useEffect(() => {
    if (!showEntrance || isLoading) return

    const elapsed = Date.now() - startedAt
    const remaining = logoLoopDuration - elapsed % logoLoopDuration
    const delay = elapsed < 2000 ? remaining + logoLoopDuration : remaining
    const timer = window.setTimeout(() => setFadeOut(true), delay)
    return () => window.clearTimeout(timer)
  }, [isLoading, showEntrance, startedAt])

  const onBackgroundError = (error: string) => {
    handleError(error)
    finishLoading()
  }

  return { showEntrance, isLoading, totalProgress, fadeOut, updateProgress, onBackgroundError }
}
