// BotScene.jsx — runs INSIDE Canvas, safe to use all R3F hooks
import { useIntroAnimation } from "../hooks/useIntroAnimation"
import { useCoreHideAnimation } from "../hooks/useCoreHideAnimation"
import { useAttentionTracking } from "../hooks/useAttentionTracking"
import { useBlinkFSM } from "../hooks/useBlinkFSM"
import { HarmonicDensity } from "./HarmonicDensity"
import { CoreSphere } from "./CoreSphere"
import { Eyes } from "./Eyes"
import { OrbitSystem } from "./OrbitSystem"
import { ParticleInstances } from "./ParticleInstances"
import { OrbitLines } from "./OrbitLines"
import { PostProcessing } from "./PostProcessing"
import * as SCENE_CONFIG from "../config/sceneConfig"

export const BotScene = ({ theme, isHidden }) => {
  // ✅ All R3F hooks live here — inside Canvas
  const intro = useIntroAnimation()
  const hideAnimation = useCoreHideAnimation(!isHidden)
  const attentionTracking = useAttentionTracking()
  const blinkFSM = useBlinkFSM()

  return (
    <HarmonicDensity>
      <CoreSphere
        theme={theme}
        intro={intro}
        hideAnimation={!isHidden ? hideAnimation : null}
        isGlass={true}
      />
      <Eyes
        theme={theme}
        intro={intro}
        hideAnimation={!isHidden ? hideAnimation : null}
      />
      <OrbitSystem
        theme={theme}
        intro={intro}
        hideAnimation={!isHidden ? hideAnimation : null}
      />
      <ParticleInstances
        theme={theme}
        intro={intro}
        orbitIndex={0}
        rippleOffset={0}
      />
      <OrbitLines
        theme={theme}
        intro={intro}
        orbitIndex={0}
        totalOrbits={SCENE_CONFIG.CONFIG.orbitCount}
        rippleOffset={0}
      />
      <PostProcessing theme={theme} intro={intro} />
    </HarmonicDensity>
  )
}
