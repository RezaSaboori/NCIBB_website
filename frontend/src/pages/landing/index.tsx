import { useRef, type CSSProperties, type RefObject } from "react"

import { CardioScene } from "../../components/landing/CardioBackground/CardioScene"

import FloatingContentWrapper from "../../components/landing/FloatingContentWrapper/FloatingContentWrapper"
import LoadingScreen from "../../components/landing/LoadingScreen/LoadingScreen"
import ServicesSection from "../../components/landing/ServicesSection/ServicesSection"
import { useAuroraStyles } from "../../hooks/landing/useAuroraStyles"
import { useCanvasPointerForwarding } from "../../hooks/landing/useCanvasPointerForwarding"
import { useCompactCardioProgress } from "../../hooks/landing/useCompactCardioProgress"
import { useInView } from "../../hooks/landing/useInView"
import { useLandingEntrance } from "../../hooks/landing/useLandingEntrance"
import { useLandingFlow } from "../../hooks/landing/useLandingFlow"
import { useScrollProgress } from "../../hooks/landing/useScrollProgress"
import { useTheme } from "../../components/theme"
import { useReducedMotionPreference } from "@/components/ui/motion/useReducedMotionPreference"
import { INTERSECTION_OBSERVER_CONFIG } from "../../config/landing/constants"
import { THEME_COLORS } from "../../config/landing/theme"
import "@/styles/transitions.css"
import "./styles.css"

const LandingPage = () => {
  const flow = useLandingFlow()
  const reducedMotion = useReducedMotionPreference()
  const animated = !flow
  const { scrollProgress } = useScrollProgress(animated)
  const auroraVisible = useAuroraStyles(animated)
  const { theme } = useTheme()
  const { showEntrance, isLoading, totalProgress, fadeOut, updateProgress, onBackgroundError } =
    useLandingEntrance(flow)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const [visualRef, visualInView] = useInView(
    INTERSECTION_OBSERVER_CONFIG
  ) as [RefObject<HTMLDivElement>, boolean]
  const [detailsRef, detailsInView] = useInView(
    INTERSECTION_OBSERVER_CONFIG
  ) as [RefObject<HTMLDivElement>, boolean]
  const [section2Ref, section2InView] = useInView(
    INTERSECTION_OBSERVER_CONFIG
  ) as [RefObject<HTMLDivElement>, boolean]

  const compactProgress = useCompactCardioProgress(visualRef, introRef, detailsRef, flow && !reducedMotion)
  const animateWords = !reducedMotion && (flow ? detailsInView : scrollProgress > 0.535)

  useCanvasPointerForwarding(heroRef, canvasRef, animated)

  const colors = THEME_COLORS[theme] || THEME_COLORS.dark
  const themeStyles = {
    "--bg-color": colors.background,
    "--text-primary": colors.textPrimary,
    "--text-secondary": colors.textSecondary,
    "--ui-bg": colors.uiBackground,
    "--ui-border": colors.uiBorder,
    "--shadow-color": colors.shadow,
    "--border-start": colors.borderStart,
    "--border-mid": colors.borderMid,
    "--border-end": colors.borderEnd,
    "--border-hover": colors.borderHover,
    "--btn-primary-bg": colors.btnPrimaryBg,
    "--btn-primary-text": colors.btnPrimaryText,
    "--btn-secondary-bg": colors.btnSecondaryBg,
    "--btn-secondary-text": colors.btnSecondaryText,
  } as CSSProperties

  const entranceClass = isLoading ? "landing-content-hidden" : "landing-content-visible"
  const revealClass = fadeOut ? " landing-content-revealed" : ""

  return (
    <>
      {showEntrance && <LoadingScreen progress={totalProgress} fadeOut={fadeOut} />}

      <div
        className={`landing-container ${flow ? "landing-container--flow" : ""} ${showEntrance ? entranceClass + revealClass : ""}`}
        style={themeStyles}
      >
        <div ref={heroRef} className="landing-hero">
          <div className="landing-hero__track" aria-hidden={flow || undefined}>
            <div ref={visualRef} className="landing-hero__visual">
              <CardioScene
                key={reducedMotion ? "static" : flow ? "compact" : "desktop"}
                canvasRef={canvasRef}
                frameRef={visualRef}
                compact={flow}
                staticScene={reducedMotion}
                visible={visualInView}
                scrollProgress={flow ? compactProgress : scrollProgress}
                theme={theme}
                backgroundColor={colors.background}
                onProgress={(progress) => updateProgress("mesh", progress)}
                onReady={() => updateProgress("webgl", 100)}
                onError={onBackgroundError}
              />
            </div>
          </div>

          <FloatingContentWrapper
            scrollProgress={scrollProgress}
            animated={animated}
            animateWords={animateWords}
            introRef={introRef}
            detailsRef={detailsRef}
            auroraVisible={auroraVisible}
          />
        </div>

        <div ref={section2Ref} className="landing-services">
          <ServicesSection isVisible={animated && section2InView} />
        </div>
      </div>
    </>
  )
}

export default LandingPage
