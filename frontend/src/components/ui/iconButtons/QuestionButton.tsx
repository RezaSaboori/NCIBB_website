import { forwardRef } from "react"

import { GlassIconButton, type IconButtonProps } from "./GlassIconButton"

export const QuestionButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function QuestionButton(props, ref) {
    return <GlassIconButton {...props} ref={ref} action="question" />
  },
)
