import { useBlinkingEyes } from "../../hooks/useBlinkingEyes"

import { useAvatarReactions } from "./useAvatarReactions"
import { useGlassAvatar } from "./useGlassAvatar"

import "./GlassAvatar.css"

export function GlassAvatar({ resolution }: { resolution: number }) {
  const orbRef = useAvatarReactions()
  const canvasRef = useGlassAvatar()
  const blink = useBlinkingEyes()

  return (
    <span ref={orbRef} aria-hidden="true" className="glass-avatar">
      <canvas ref={canvasRef} height={resolution} width={resolution} />
      <span className="glass-avatar__fallback" />
      <span className="glass-avatar__eyes" data-blink={blink ?? undefined}>
        <span className="glass-avatar__eye" />
        <span className="glass-avatar__eye" />
      </span>
    </span>
  )
}
