import React, { useEffect, useRef } from "react"
import "./SecondaryContentContainer.css"

const SecondaryContentContainer = ({ scrollProgress, onPortalClick }) => {
  const containerRef = useRef(null)
  const text1Ref = useRef(null)
  const text2Ref = useRef(null)

  const texts = ["سریع", "دقیق", "یکپارچه"]
  const morphTime = 1.5
  const cooldownTime = 2.5

  useEffect(() => {
    let textIndex = texts.length - 1
    let time = new Date()
    let morph = 0
    let cooldown = cooldownTime

    if (text1Ref.current && text2Ref.current) {
      text1Ref.current.textContent = texts[textIndex % texts.length]
      text2Ref.current.textContent = texts[(textIndex + 1) % texts.length]
    }

    const setMorph = (fraction) => {
      if (text1Ref.current && text2Ref.current && containerRef.current) {
        containerRef.current.style.filter = "url(#threshold) blur(1.2px)"

        text2Ref.current.style.filter = `blur(${Math.min(16 / fraction - 16, 100)}px)`
        text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`

        fraction = 1 - fraction
        text1Ref.current.style.filter = `blur(${Math.min(16 / fraction - 16, 100)}px)`
        text1Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`

        text1Ref.current.textContent = texts[textIndex % texts.length]
        text2Ref.current.textContent = texts[(textIndex + 1) % texts.length]
      }
    }

    const doMorph = () => {
      morph -= cooldown
      cooldown = 0
      let fraction = morph / morphTime
      if (fraction > 1) {
        cooldown = cooldownTime
        fraction = 1
      }
      setMorph(fraction)
    }

    const doCooldown = () => {
      morph = 0
      if (text1Ref.current && text2Ref.current && containerRef.current) {
        containerRef.current.style.filter = ""
        text2Ref.current.style.filter = ""
        text2Ref.current.style.opacity = "100%"
        text1Ref.current.style.filter = ""
        text1Ref.current.style.opacity = "0%"
      }
    }

    let animationFrameId
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      let newTime = new Date()
      let shouldIncrementIndex = cooldown > 0
      let dt = (newTime - time) / 1000
      time = newTime
      cooldown -= dt

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex++
        }
        doMorph()
      } else {
        doCooldown()
      }
    }

    animate()
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1)
  const secondPageProgress = Math.min(
    Math.max((clampedProgress - 0.5) / 0.35, 0),
    1
  )
  const secondaryBoxOffset = (1 - secondPageProgress) * 35
  const secondaryBoxOpacity = Math.pow(secondPageProgress, 1.25)
  const isVisible = secondPageProgress > 0.1

  const containerStyle = {
    opacity: secondaryBoxOpacity,
    transform: `translateY(${secondaryBoxOffset}vh)`,
    pointerEvents: secondaryBoxOpacity > 0.05 ? "auto" : "none",
  }

  return (
    <div
      className={`secondary-content-wrapper ${isVisible ? "is-visible" : ""}`}
      style={containerStyle}
    >
      <div className="secondary-content-container">
        <div>
          <div className="morph-container" ref={containerRef}>
            <h3 className="secondary-content-title" ref={text1Ref}></h3>
            <h3 className="secondary-content-title" ref={text2Ref}></h3>
          </div>

          <svg id="filters" style={{ display: "none" }}>
            <defs>
              <filter id="threshold">
                <feColorMatrix
                  in="SourceGraphic"
                  type="matrix"
                  values="1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 255 -140"
                />
              </filter>
            </defs>
          </svg>

          <p className="secondary-content-description">
            <span className="blue-highlight">
              بانک ملی زیست‌داده یکپارچه قلب و عروق
            </span>
            ، به عنوان زیرساخت مرجع و پیشگام در اکوسیستم تحقیقاتی کشور، با
            استانداردهای نوین{" "}
            <span className="green-highlight">پزشکی عمیق و هوش مصنوعی</span>،
            بستری جامع برای تحول در پژوهش‌های کاردیوواسکولار فراهم آورده است.
            این پلتفرم ملی با معماری پیشرفته چندلایه و مدیریت بیش از ۳۷۸۶ المان
            داده‌ای دقیق، خدمات خود را در سه سطح{" "}
            <span className="highlight">داده، اطلاعات و دانش (DIK)</span> به
            جامعه پزشکی و محققین ارائه می‌دهد تا ضمن پایش ملی روندهای
            اپیدمیولوژیک و تسهیل سیاست‌گذاری‌های مبتنی بر شواهد، مسیر دستیابی به
            راهکارهای درمانی دقیق و ارتقای ایمنی بیمار را هموار سازد.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SecondaryContentContainer
