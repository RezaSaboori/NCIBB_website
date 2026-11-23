import { useEffect, useRef } from "react"

function limitGaze(position: number, start: number, size: number) {
  return Math.max(-1, Math.min(1, (2 * (position - start)) / size - 1))
}

export function useAvatarReactions() {
  const orbRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const orb = orbRef.current
    const control = orb?.closest<HTMLElement>("a, button")
    const eye = orb?.querySelector(".glass-avatar__eye")

    if (!orb || !control || !eye) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let pointer: PointerEvent
    let frame: number | undefined
    let bounce: Animation | undefined
    let wink: Animation | undefined

    const followPointer = (event: PointerEvent) => {
      if (reducedMotion.matches || event.pointerType === "touch") return

      pointer = event
      frame ??= window.requestAnimationFrame(() => {
        frame = undefined

        const { left, top, width, height } = control.getBoundingClientRect()

        if (!width || !height) return

        const x = limitGaze(pointer.clientX, left, width) * 11
        const y = limitGaze(pointer.clientY, top, height) * 9

        orb.toggleAttribute("data-hovered", true)
        orb.style.setProperty("--avatar-gaze-x", `${x}%`)
        orb.style.setProperty("--avatar-gaze-y", `${y}%`)
      })
    }

    const resetGaze = () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      frame = undefined
      orb.removeAttribute("data-hovered")
      orb.style.removeProperty("--avatar-gaze-x")
      orb.style.removeProperty("--avatar-gaze-y")
    }

    const stopReactions = () => {
      resetGaze()
      bounce?.cancel()
      wink?.cancel()
    }

    const reactToClick = () => {
      if (reducedMotion.matches) return

      bounce?.cancel()
      wink?.cancel()
      bounce = orb.animate(
        [
          { scale: "1" },
          { scale: "1.11 0.88", offset: 0.2 },
          { scale: "0.97 1.09", offset: 0.48 },
          { scale: "1.035 0.98", offset: 0.74 },
          { scale: "1" },
        ],
        { duration: 430, easing: "ease-in-out" },
      )
      wink = eye.animate(
        [
          { scale: "1" },
          { scale: "1 0.1", offset: 0.33 },
          { scale: "1 0.1", offset: 0.6 },
          { scale: "1" },
        ],
        { duration: 260, easing: "ease-in-out" },
      )
    }

    control.addEventListener("pointermove", followPointer, { passive: true })
    control.addEventListener("pointerleave", resetGaze)
    control.addEventListener("pointercancel", resetGaze)
    control.addEventListener("click", reactToClick)
    reducedMotion.addEventListener("change", stopReactions)

    return () => {
      stopReactions()
      control.removeEventListener("pointermove", followPointer)
      control.removeEventListener("pointerleave", resetGaze)
      control.removeEventListener("pointercancel", resetGaze)
      control.removeEventListener("click", reactToClick)
      reducedMotion.removeEventListener("change", stopReactions)
    }
  }, [])

  return orbRef
}
