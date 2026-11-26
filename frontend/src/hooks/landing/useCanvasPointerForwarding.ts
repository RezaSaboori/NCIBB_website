import { useEffect, type RefObject } from "react"

export function useCanvasPointerForwarding(
  sectionRef: RefObject<HTMLElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  enabled: boolean,
) {
  useEffect(() => {
    const section = sectionRef.current
    if (!enabled || !section) return

    const forwardPointerMove = (event: PointerEvent) => {
      const canvas = canvasRef.current
      if (!canvas || event.target === canvas || event.pointerType === "touch") return

      canvas.dispatchEvent(new PointerEvent("pointermove", {
        pointerType: event.pointerType,
        clientX: event.clientX,
        clientY: event.clientY,
      }))
    }

    section.addEventListener("pointermove", forwardPointerMove, { passive: true, capture: true })
    return () => section.removeEventListener("pointermove", forwardPointerMove, { capture: true })
  }, [sectionRef, canvasRef, enabled])
}
