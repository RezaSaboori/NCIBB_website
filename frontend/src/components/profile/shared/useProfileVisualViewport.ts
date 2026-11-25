import { useLayoutEffect } from "react"

const minimumKeyboardInset = 100

export function useProfileVisualViewport(enabled: boolean) {
  useLayoutEffect(() => {
    const viewport = window.visualViewport
    if (!enabled || !viewport) return

    const root = document.documentElement
    const narrow = window.matchMedia("(max-width: 960px)")
    const clear = () => {
      root.removeAttribute("data-profile-keyboard")
      root.style.removeProperty("--profile-viewport-height")
      root.style.removeProperty("--profile-viewport-top")
    }
    const update = () => {
      const keyboardInset = root.clientHeight - viewport.height
      if (!narrow.matches || Math.abs(viewport.scale - 1) > 0.01 || keyboardInset < minimumKeyboardInset) {
        clear()
        return
      }

      root.style.setProperty("--profile-viewport-height", `${viewport.height}px`)
      root.style.setProperty("--profile-viewport-top", `${viewport.offsetTop}px`)
      root.setAttribute("data-profile-keyboard", "")
    }

    update()
    narrow.addEventListener("change", update)
    viewport.addEventListener("resize", update)
    viewport.addEventListener("scroll", update)
    return () => {
      narrow.removeEventListener("change", update)
      viewport.removeEventListener("resize", update)
      viewport.removeEventListener("scroll", update)
      clear()
    }
  }, [enabled])
}
