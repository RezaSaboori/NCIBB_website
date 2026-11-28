import { forwardRef } from "react"

import { GlassIconButton, type IconButtonProps } from "./GlassIconButton"

export const MinimizeButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function MinimizeButton(props, ref) {
    return <GlassIconButton {...props} ref={ref} action="minimize" />
  },
)
