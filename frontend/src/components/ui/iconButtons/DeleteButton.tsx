import { forwardRef } from "react"

import { GlassIconButton, type IconButtonProps } from "./GlassIconButton"

export const DeleteButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function DeleteButton(props, ref) {
    return <GlassIconButton {...props} ref={ref} action="delete" />
  },
)
