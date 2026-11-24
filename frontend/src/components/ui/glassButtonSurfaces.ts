export const glassButtonSurfaces = {
  primary: "blue-glass",
  danger: "red-glass",
  pending: "indigo-glass",
  success: "green-glass",
} as const

export type GlassButtonTone = keyof typeof glassButtonSurfaces
