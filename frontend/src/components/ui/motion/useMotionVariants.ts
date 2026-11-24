import { fadeMotion, motionPresets } from "./motionPresets"
import { useReducedMotionPreference } from "./useReducedMotionPreference"

export function useMotionVariants(preset: keyof typeof motionPresets) {
  return useReducedMotionPreference() ? fadeMotion : motionPresets[preset]
}
