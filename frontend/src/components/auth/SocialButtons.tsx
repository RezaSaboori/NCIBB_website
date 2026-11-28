import { Button } from "@heroui/react"
import { Icon } from "@iconify/react"

export const SocialButtons = () => {
  return (
    <div className="flex gap-4">
      <Button className="ui-control-button" fullWidth radius="full" startContent={<Icon icon="flat-color-icons:google" />}>
        Sign in with Google
      </Button>
    </div>
  )
}
