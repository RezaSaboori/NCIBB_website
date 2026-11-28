import { forwardRef } from "react"

import { GlassIconButton, type IconButtonProps } from "./GlassIconButton"

export const CloseButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function CloseButton(props, ref) {
    return <GlassIconButton {...props} ref={ref} action="close" />
  },
)
