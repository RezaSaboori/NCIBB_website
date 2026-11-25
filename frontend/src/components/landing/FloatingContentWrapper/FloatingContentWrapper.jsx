import PrimaryContentContainer from "../PrimaryContentContainer/PrimaryContentContainer"
import SecondaryContentContainer from "../SecondaryContentContainer/SecondaryContentContainer"
import "./FloatingContentWrapper.css"

const FloatingContentWrapper = ({
  scrollProgress,
  animated,
  animateWords,
  auroraVisible,
  introRef,
  detailsRef,
}) => (
  <div className="floating-content-outer">
    <div className="floating-content-inner">
      <PrimaryContentContainer
        scrollProgress={scrollProgress}
        animated={animated}
        auroraVisible={auroraVisible}
        introRef={introRef}
      />
      <SecondaryContentContainer
        scrollProgress={scrollProgress}
        animated={animated}
        animateWords={animateWords}
        detailsRef={detailsRef}
      />
    </div>
  </div>
)

export default FloatingContentWrapper
