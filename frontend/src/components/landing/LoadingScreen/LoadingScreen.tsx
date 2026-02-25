import React, { useState, useEffect } from "react"
import "./LoadingScreen.css"
import frame1 from "./assets/frame 1.svg"
import frame2 from "./assets/frame 2.svg"
import frame3 from "./assets/frame 3.svg"

interface LoadingScreenProps {
  progress?: number
  message?: string
  fadeOut?: boolean
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ fadeOut = false }) => {
  const [assetsLoaded, setAssetsLoaded] = useState(false)

  useEffect(() => {
    // Disable scrolling when loading screen is active
    if (!fadeOut) {
      document.body.style.overflow = "hidden"
    } else {
      // Re-enable after fade animation completes
      const timer = setTimeout(() => {
        document.body.style.overflow = ""
      }, 1200)
      return () => clearTimeout(timer)
    }

    const images = [frame1, frame2, frame3]
    let loadedCount = 0

    const handleLoad = () => {
      loadedCount++
      if (loadedCount === images.length) {
        setAssetsLoaded(true)
      }
    }

    images.forEach((src) => {
      const img = new Image()
      img.src = src
      img.onload = handleLoad
      img.onerror = handleLoad // Continue even if one fails
    })

    return () => {
      document.body.style.overflow = ""
    }
  }, [fadeOut])

  return (
    <div
      className={`loading-screen-overlay ${fadeOut ? "fade-out" : ""} ${assetsLoaded ? "assets-ready" : "assets-loading"}`}
    >
      <div className="loading-content">
        <div className="logo-animation-container">
          <img src={frame1} alt="" className="logo-frame frame-1" />
          <img src={frame2} alt="" className="logo-frame frame-2" />
          <img src={frame3} alt="" className="logo-frame frame-3" />
          <div className="logo-glow"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
