import { useLayoutEffect, useRef, type Key } from "react"
import { dialogResizeDuration, motionEasing } from "./motionPresets"
import { useReducedMotionPreference } from "./useReducedMotionPreference"

export function useSurfaceReveal({ resize, pending, contentKey }: { resize: boolean; pending: boolean; contentKey?: Key }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const inputs = useRef({ pending, contentKey })
  const update = useRef<() => void>()
  const reducedMotion = useReducedMotionPreference()

  useLayoutEffect(() => {
    inputs.current = { pending, contentKey }
    update.current?.()
  }, [contentKey, pending])

  useLayoutEffect(() => {
    const frame = frameRef.current
    const content = contentRef.current
    if (!frame || !content) return

    const shell = frame.closest<HTMLElement>("[data-motion-surface]")
    const body = frame.parentElement
    const entrance = shell?.getAnimations?.().find((animation) =>
      "animationName" in animation && animation.animationName === "ui-surface-enter")
    let opening = !!entrance && !reducedMotion
    let resizeAnimation: Animation | undefined
    let targetHeight: number | undefined
    let lastKey = inputs.current.contentKey
    let waiting = false
    let needsReveal = true
    let disposed = false
    let viewportFrame = 0

    const isWaiting = () => inputs.current.pending || !!content.querySelector("[data-motion-pending]")

    const reveal = () => {
      if (disposed || !needsReveal || waiting || opening || resizeAnimation) return
      needsReveal = false
      content.dataset.motionReveal = "reveal"
    }

    const measure = () => {
      const pending = isWaiting()
      const key = inputs.current.contentKey
      needsReveal ||= key !== lastKey || pending !== waiting
      lastKey = key
      waiting = pending
      if (pending) content.dataset.motionReveal = "waiting"
      else if (needsReveal) content.dataset.motionReveal = "hold"

      if (pending && !inputs.current.pending && resizeAnimation) {
        targetHeight = frame.offsetHeight
        resizeAnimation.cancel()
        resizeAnimation = undefined
        frame.style.blockSize = `${targetHeight}px`
      }

      if (resize && (!pending || inputs.current.pending || targetHeight === undefined)) {
        const natural = content.offsetHeight
        const bodyStyle = body && getComputedStyle(body)
        const limit = shell && body && bodyStyle ? parseFloat(getComputedStyle(shell).maxBlockSize)
          - (shell.offsetHeight - body.clientHeight)
          - parseFloat(bodyStyle.paddingBlockStart) - parseFloat(bodyStyle.paddingBlockEnd) : NaN
        const height = limit > 0 ? Math.min(natural, limit) : natural

        if (height !== targetHeight) {
          const from = frame.offsetHeight
          const shouldAnimate = targetHeight !== undefined && !reducedMotion && Math.abs(from - height) > 1 && !!frame.animate
          targetHeight = height
          resizeAnimation?.cancel()
          resizeAnimation = undefined
          frame.style.blockSize = `${height}px`

          if (shouldAnimate) {
            const animation = frame.animate([{ blockSize: `${from}px` }, { blockSize: `${height}px` }], {
              duration: dialogResizeDuration * 1000,
              easing: motionEasing,
            })
            resizeAnimation = animation
            void animation.finished.then(() => {
              if (resizeAnimation !== animation) return
              resizeAnimation = undefined
              reveal()
            }, () => undefined)
          }
        }
      }

      reveal()
    }

    if (opening) void entrance?.finished.then(() => {
      opening = false
      reveal()
    }, () => {
      opening = false
      reveal()
    })

    update.current = measure
    measure()
    const sizes = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure)
    sizes?.observe(content)
    const loading = new MutationObserver(() => { if (waiting !== isWaiting()) measure() })
    loading.observe(content, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-motion-pending"] })
    const viewport = window.visualViewport ?? window
    const measureViewport = () => {
      cancelAnimationFrame(viewportFrame)
      viewportFrame = requestAnimationFrame(measure)
    }
    if (resize) viewport.addEventListener("resize", measureViewport)

    return () => {
      disposed = true
      sizes?.disconnect()
      loading.disconnect()
      viewport.removeEventListener("resize", measureViewport)
      cancelAnimationFrame(viewportFrame)
      resizeAnimation?.cancel()
      frame.style.removeProperty("block-size")
      update.current = undefined
    }
  }, [reducedMotion, resize])

  return { frameRef, contentRef }
}
