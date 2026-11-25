import { lazy, Suspense, useState, type RefObject } from "react"
import { CARDIO_BACKGROUND_CONFIG } from "@/config/landing/constants"

const CardioBackground = lazy(() => import("./CardioBackground"))
const centered = { x: 0, y: 0 }
const compactSceneConfig = {
  compact: true,
  heartProjectionScale: 1.42,
  heartVerticalOffset: 0.09,
  ambientType1Count: 900,
  ambientType2Count: 700,
}

interface CardioSceneProps {
  canvasRef: RefObject<HTMLCanvasElement>
  compact: boolean
  staticScene: boolean
  visible: boolean
  scrollProgress: number
  theme: "light" | "dark"
  backgroundColor: string
  onProgress: (progress: number) => void
  onReady: () => void
  onError: (error: string) => void
}

export function CardioScene({
  canvasRef,
  compact,
  staticScene,
  visible,
  scrollProgress,
  theme,
  backgroundColor,
  onProgress,
  onReady,
  onError,
}: CardioSceneProps) {
  const [ready, setReady] = useState(false)

  return (
    <>
      {compact && (!ready || staticScene) && (
        <img
          className="landing-hero__poster"
          src={`${import.meta.env.BASE_URL}landing/cardio-${theme}.webp`}
          alt=""
        />
      )}
      {!staticScene && (
        <Suspense fallback={null}>
          <CardioBackground
            ref={canvasRef}
            quality={compact ? "medium" : CARDIO_BACKGROUND_CONFIG.QUALITY}
            autoRotate={CARDIO_BACKGROUND_CONFIG.AUTO_ROTATE}
            interactive={!compact && CARDIO_BACKGROUND_CONFIG.INTERACTIVE}
            enableDragRotation={CARDIO_BACKGROUND_CONFIG.ENABLE_DRAG_ROTATION}
            enableWheelZoom={CARDIO_BACKGROUND_CONFIG.ENABLE_WHEEL_ZOOM}
            backgroundColor={backgroundColor}
            theme={theme}
            contentOffset={compact ? centered : CARDIO_BACKGROUND_CONFIG.CONTENT_OFFSET}
            configOverrides={compact ? compactSceneConfig : undefined}
            compact={compact}
            paused={!visible}
            scrollProgress={scrollProgress}
            onLoadingProgress={onProgress}
            onInitialized={() => {
              setReady(true)
              onReady()
            }}
            onError={(error) => {
              setReady(false)
              onError(error)
            }}
          />
        </Suspense>
      )}
    </>
  )
}
