import { useEffect, useId, useRef } from "react"

const words = ["سریع", "دقیق", "یکپارچه"]
const holdDuration = 2500
const morphDuration = 1500

export function CardioMorphHeading({ animated, compact }) {
  const filterId = useId()
  const heading = useRef(null)
  const outgoing = useRef(null)
  const incoming = useRef(null)
  const label = words.join("، ")

  useEffect(() => {
    if (!animated) return

    const container = heading.current
    const first = outgoing.current
    const second = incoming.current
    if (!container || !first || !second) return

    let word = 0
    let timer
    let frame

    const hold = () => {
      container.style.filter = ""
      first.textContent = words[word]
      second.textContent = words[(word + 1) % words.length]
      first.style.opacity = "1"
      second.style.opacity = "0"
      first.style.filter = ""
      second.style.filter = ""

      timer = window.setTimeout(() => {
        const start = performance.now()
        if (!compact) container.style.filter = `url("#${filterId}") blur(1.2px)`

        const morph = (time) => {
          const fraction = Math.min(1, (time - start) / morphDuration)

          for (const [element, visibility] of [[first, 1 - fraction], [second, fraction]]) {
            element.style.opacity = String(Math.pow(visibility, 0.4))
            const blur = compact ? (1 - visibility) * 4 : Math.min(16 / visibility - 16, 100)
            element.style.filter = `blur(${blur}px)`
          }

          if (fraction < 1) {
            frame = requestAnimationFrame(morph)
          } else {
            word = (word + 1) % words.length
            hold()
          }
        }

        frame = requestAnimationFrame(morph)
      }, holdDuration)
    }

    hold()
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
      container.style.filter = ""
    }
  }, [animated, compact, filterId])

  return (
    <>
      <h2 className="morph-container" ref={heading} aria-label={label}>
        {animated ? (
          <>
            <span ref={outgoing} className="secondary-content-title" aria-hidden="true">{words[0]}</span>
            <span ref={incoming} className="secondary-content-title" aria-hidden="true" style={{ opacity: 0 }}>{words[1]}</span>
          </>
        ) : (
          <span className="secondary-content-title secondary-content-title--static">{label}</span>
        )}
      </h2>
      {animated && !compact && (
        <svg width="0" height="0" className="cardio-morph-filter" aria-hidden="true">
          <filter id={filterId}>
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140"
            />
          </filter>
        </svg>
      )}
    </>
  )
}
