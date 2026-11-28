import { useEffect, useRef } from "react"
import { useReducedMotionPreference } from "./useReducedMotionPreference"
import "./scrollText.css"

export function useScrollText(text: string, focusable: boolean, stopTouchPropagation: boolean) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)
  const reducedMotion = useReducedMotionPreference()

  useEffect(() => {
    const wrapper = wrapperRef.current
    const inner = innerRef.current
    if (!wrapper || !inner) return

    const focusTarget = wrapper.closest(".ui-scroll-text-trigger") ?? wrapper
    let animation: Animation | undefined
    let touchPress = false

    const stop = () => {
      animation?.cancel()
      animation = undefined
      delete wrapper.dataset.scrollPlaying
    }

    const measure = () => {
      const overflow = Math.max(0, inner.scrollWidth - wrapper.clientWidth)
      wrapper.style.setProperty("--scroll-distance", `${overflow}px`)
      wrapper.dataset.scrollOverflow = String(overflow > 0)
      if (focusable) wrapper.tabIndex = overflow > 0 && !reducedMotion ? 0 : -1
      if (!overflow) stop()
      return overflow
    }

    const play = (hold: boolean) => {
      if (reducedMotion || !inner.animate || !measure()) return false
      stop()
      wrapper.dataset.scrollPlaying = "true"
      const end = "translateX(calc(var(--dz-scroll-direction) * var(--scroll-distance)))"
      const playback = inner.animate([
        { transform: "translateX(0)", offset: 0 },
        { transform: "translateX(0)", offset: 0.15 },
        { transform: end, offset: 0.85 },
        { transform: end, offset: 1 },
      ], { duration: 3000, fill: "forwards" })
      animation = playback
      playback.onfinish = () => {
        if (!hold && animation === playback) stop()
      }
      return true
    }

    const enter = (event: PointerEvent) => {
      if (event.pointerType === "mouse") play(true)
    }
    const leave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") stop()
    }
    const press = (event: PointerEvent) => {
      touchPress = event.pointerType === "touch" || event.pointerType === "pen"
    }
    const cancelPress = () => { touchPress = false }
    const click = (event: MouseEvent) => {
      const pointer = (event as PointerEvent).pointerType
      // WebKit can report a mouse click after a touch pointer sequence.
      const touch = pointer === "touch" || pointer === "pen" || (touchPress && event.detail > 0)
      touchPress = false
      if (touch && play(false) && stopTouchPropagation) event.stopPropagation()
    }
    const focus = () => {
      if (focusTarget.matches(":focus-visible")) play(true)
    }
    const keydown = (event: KeyboardEvent) => {
      if (!event.repeat && (event.key === "Enter" || event.key === " ") && play(false)) {
        event.preventDefault()
      }
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(wrapper)
    observer.observe(inner)
    wrapper.addEventListener("pointerenter", enter)
    wrapper.addEventListener("pointerleave", leave)
    wrapper.addEventListener("pointerdown", press)
    wrapper.addEventListener("pointercancel", cancelPress)
    wrapper.addEventListener("click", click)
    if (focusable) wrapper.addEventListener("keydown", keydown)
    focusTarget.addEventListener("focus", focus)
    focusTarget.addEventListener("blur", stop)

    return () => {
      observer.disconnect()
      stop()
      wrapper.removeEventListener("pointerenter", enter)
      wrapper.removeEventListener("pointerleave", leave)
      wrapper.removeEventListener("pointerdown", press)
      wrapper.removeEventListener("pointercancel", cancelPress)
      wrapper.removeEventListener("click", click)
      wrapper.removeEventListener("keydown", keydown)
      focusTarget.removeEventListener("focus", focus)
      focusTarget.removeEventListener("blur", stop)
    }
  }, [text, focusable, stopTouchPropagation, reducedMotion])

  return { wrapperRef, innerRef }
}
