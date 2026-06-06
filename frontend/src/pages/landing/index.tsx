import { useRef, RefObject, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import CardioBackground from "../../components/landing/CardioBackground/CardioBackground"
import FloatingContentWrapper from "../../components/landing/FloatingContentWrapper/FloatingContentWrapper"
import LoadingScreen from "../../components/landing/LoadingScreen/LoadingScreen"
import ServicesSection from "../../components/landing/ServicesSection/ServicesSection"
import { useInView } from "../../hooks/landing/useInView"
import { useScrollProgress } from "../../hooks/landing/useScrollProgress"
import { useCanvasMouseForwarding } from "../../hooks/landing/useCanvasMouseForwarding"
import { useAuroraStyles } from "../../hooks/landing/useAuroraStyles"
import { useLoadingState } from "../../hooks/landing/useLoadingState"
import { useTheme } from "../../components/theme"
import {
  CARDIO_BACKGROUND_CONFIG,
  INTERSECTION_OBSERVER_CONFIG,
} from "../../config/landing/constants"
import { THEME_COLORS } from "../../config/landing/theme"
import { preloadThemes, applyThemeVariables } from "../../utils/theme/themePreloader"
import "@/styles/transitions.css"
import "./styles.css"

const CardioBackgroundAny = CardioBackground as any

const LandingPage = () => {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [section1Ref, section1InView] = useInView(
    INTERSECTION_OBSERVER_CONFIG
  ) as [RefObject<HTMLDivElement>, boolean]
  
  const [section2Ref, section2InView] = useInView(
    INTERSECTION_OBSERVER_CONFIG
  ) as [RefObject<HTMLDivElement>, boolean]

  const { scrollProgress } = useScrollProgress(containerRef)
  const auroraVisible = useAuroraStyles()
  const { theme } = useTheme()
  const { 
    isLoading, 
    totalProgress, 
    updateProgress, 
    finishLoading, 
    handleError 
  } = useLoadingState()
  
  const [showContent, setShowContent] = useState(false)
  const [fadeOutOverlay, setFadeOutOverlay] = useState(false)

  // Preload themes and essential assets
  useEffect(() => {
    const init = async () => {
      try {
        await preloadThemes((p) => updateProgress('theme', p))
        applyThemeVariables(theme)
        updateProgress('assets', 100) // Essential icons are small
      } catch (err) {
        handleError("Failed to preload theme assets")
      }
    }
    init()
  }, [])

  // Optimized transition sequence synchronized with logo loop
  useEffect(() => {
    if (!isLoading) {
      const loopDuration = 3500;
      const now = Date.now();
      const startTime = (window as any).loadingStartTime || now;
      const elapsed = now - startTime;
      const remainingInLoop = loopDuration - (elapsed % loopDuration);
      
      const minimumVisibility = 2000;
      const delay = elapsed < minimumVisibility 
        ? (remainingInLoop + loopDuration) 
        : remainingInLoop;

      setShowContent(true)

      const timer = setTimeout(() => {
        setFadeOutOverlay(true)
      }, delay)
      
      return () => clearTimeout(timer)
    } else {
      if (!(window as any).loadingStartTime) {
        (window as any).loadingStartTime = Date.now();
      }
    }
  }, [isLoading])

  const colors = THEME_COLORS[theme] || THEME_COLORS.dark

  useCanvasMouseForwarding(section1Ref, canvasRef)

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
  } as React.CSSProperties

  const handleLoginClick = () => {
    navigate("/profile")
  }

  const handleSignupClick = () => {
    navigate("/profile")
  }

  const handlePortalClick = () => {
    navigate("/portal")
  }

  return (
    <>
      <LoadingScreen 
        progress={totalProgress} 
        fadeOut={fadeOutOverlay} 
      />
      
      <div 
        ref={containerRef} 
        className={`landing-container ${showContent ? 'landing-content-visible' : 'landing-content-hidden'} ${fadeOutOverlay ? 'landing-content-revealed' : ''}`}
        style={themeStyles}
      >
        <div ref={section1Ref} className="section-1">
          <CardioBackgroundAny
            ref={canvasRef}
            quality={CARDIO_BACKGROUND_CONFIG.QUALITY}
            autoRotate={CARDIO_BACKGROUND_CONFIG.AUTO_ROTATE}
            interactive={CARDIO_BACKGROUND_CONFIG.INTERACTIVE}
            enableDragRotation={CARDIO_BACKGROUND_CONFIG.ENABLE_DRAG_ROTATION}
            enableWheelZoom={CARDIO_BACKGROUND_CONFIG.ENABLE_WHEEL_ZOOM}
            backgroundColor={colors.background}
            theme={theme}
            contentOffset={CARDIO_BACKGROUND_CONFIG.CONTENT_OFFSET}
            paused={!section1InView}
            scrollProgress={scrollProgress}
            onLoadingProgress={(p: number) => updateProgress('mesh', p)}
            onInitialized={() => updateProgress('webgl', 100)}
            onError={(err: string) => handleError(err)}
          />

          <FloatingContentWrapper
            scrollProgress={scrollProgress}
            auroraVisible={auroraVisible}
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignupClick}
            onPortalClick={handlePortalClick}
          />
        </div>
        
        <div ref={section2Ref} className="section-2">
          <ServicesSection isVisible={section2InView} />
        </div>
      </div>
    </>
  )
}

export default LandingPage
