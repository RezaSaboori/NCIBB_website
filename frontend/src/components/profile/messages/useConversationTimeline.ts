import { useLayoutEffect, useRef } from "react"

export function useConversationTimeline(page: number, newest: number | undefined, outgoing: string | number | undefined, expanded: boolean) {
  const viewport = useRef<HTMLDivElement>(null)
  const atBottom = useRef(true)
  const previous = useRef({ page, outgoing })

  useLayoutEffect(() => {
    const element = viewport.current
    if (!element || expanded) return
    if (atBottom.current || previous.current.page !== page || previous.current.outgoing !== outgoing) {
      element.scrollTop = element.scrollHeight
      atBottom.current = true
    }
    previous.current = { page, outgoing }
  }, [page, newest, outgoing, expanded])

  const onScroll = () => {
    const element = viewport.current
    if (element && !expanded) atBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 32
  }

  return { viewport, onScroll }
}
