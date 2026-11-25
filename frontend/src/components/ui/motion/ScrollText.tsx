import { useScrollText } from "./useScrollText"

export function ScrollText({ text }: { text: string }) {
  const { wrapperRef, innerRef } = useScrollText<HTMLSpanElement, HTMLSpanElement>()

  return (
    <span className="dz-scroll-wrapper ui-scroll-text" ref={wrapperRef} dir="auto">
      <span className="ui-scroll-text__label">{text}</span>
      <span className="dz-scroll-inner" ref={innerRef} aria-hidden="true">{text}</span>
    </span>
  )
}
