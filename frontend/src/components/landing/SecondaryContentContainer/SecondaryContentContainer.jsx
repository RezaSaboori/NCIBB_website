import { CardioMorphHeading } from "./CardioMorphHeading"
import "./SecondaryContentContainer.css"

const SecondaryContentContainer = ({ scrollProgress, animated, animateWords, detailsRef }) => {
  const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1)
  const secondPageProgress = Math.min(
    Math.max((clampedProgress - 0.5) / 0.35, 0),
    1
  )
  const secondaryBoxOffset = (1 - secondPageProgress) * 35
  const secondaryBoxOpacity = Math.pow(secondPageProgress, 1.25)
  const isVisible = secondPageProgress > 0.1

  const containerStyle = animated ? {
    opacity: secondaryBoxOpacity,
    transform: `translateY(${secondaryBoxOffset}vh)`,
    pointerEvents: secondaryBoxOpacity > 0.05 ? "auto" : "none",
    visibility: secondaryBoxOpacity > 0.05 ? "visible" : "hidden",
  } : undefined

  return (
    <div
      className={`secondary-content-wrapper ${animateWords || (animated && isVisible) ? "is-visible" : ""}`}
      ref={detailsRef}
      style={containerStyle}
    >
      <div className="secondary-content-container">
        <div>
          <CardioMorphHeading animated={animateWords} compact={!animated} />

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
