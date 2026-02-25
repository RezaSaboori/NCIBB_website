import React from "react"
import { Tooltip } from "@heroui/react"
import { motion } from "framer-motion"
import RotatingBorderButton from "../RotatingBorderButton/RotatingBorderButton"
import AuroraButtonContent from "../AuroraButtonContent/AuroraButtonContent"
import cticiLogo from "./assets/ctici.svg"
import ministryLogo from "./assets/ministry.svg"
import rajaeiLogo from "./assets/RAJAEI.svg"
import "./PrimaryContentContainer.css"

const PrimaryContentContainer = ({
  scrollProgress,
  auroraVisible,
  onLoginClick,
  onSignupClick,
}) => {
  const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1)
  const firstPageProgress = Math.min(
    Math.max((clampedProgress - 0.1) / 0.4, 0),
    1
  )
  const firstPageOpacity = Math.max(0, 1 - firstPageProgress)

  const containerStyle = {
    transform: `translateY(${-Math.min(clampedProgress * 6, 10)}vh)`,
    opacity: firstPageOpacity,
    pointerEvents: firstPageOpacity > 0.05 ? "auto" : "none",
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for a professional feel
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <div className="primary-content-wrapper" style={containerStyle}>
      <motion.div
        className="primary-content-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="primary-content-title" variants={itemVariants}>
          <div className="title-first-line">
            <h1 className="justified-title">
              <span>بانـک</span>
              <span>ملـی</span>
              <span>زیسـت</span>
              <span>داده</span>
            </h1>
          </div>
          <h1 className="justified-title">
            <span>یکپـارچـه</span>
            <span>قلـب</span>
            <span>و</span>
            <span>عـروق</span>
          </h1>
        </motion.div>
        <div className="primary-content-subtitle-container">
          <motion.p
            className="primary-content-description"
            variants={itemVariants}
          >
            <strong>از داده خام تا تحلیل نهایی</strong> | ما با جمع آوری داده
            های سلامت موجود بصورت یکپارچه، منبعی ارزشمند را برای محققین قلب و
            عـروق بوجـود آورده ایـم.
          </motion.p>
          <motion.div
            className="primary-content-buttons"
            variants={itemVariants}
          >
            <div className="primary-content-buttons-group">
              <RotatingBorderButton variant="secondary" onClick={onLoginClick}>
                <div className="button-content">
                  <span className="button-text-secondary">وارد شوید</span>
                </div>
              </RotatingBorderButton>

              <RotatingBorderButton variant="primary" onClick={onSignupClick}>
                <AuroraButtonContent visible={auroraVisible} />
                <div className="button-content">
                  <span className="button-text-primary">ثبت‌نام کنید</span>
                </div>
              </RotatingBorderButton>
            </div>

            <div className="title-logos">
              <Tooltip
                content="مرکز فناوری و نوآوری انفرماتیک و قلب و عروق"
                classNames={{
                  content: "logo-tooltip-content",
                }}
                delay={0}
                closeDelay={0}
                motionProps={{
                  variants: {
                    exit: { opacity: 0, y: 5, transition: { duration: 0.1 } },
                    enter: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                  },
                }}
              >
                <img src={cticiLogo} alt="CTICI" className="title-logo" />
              </Tooltip>
              <Tooltip
                content="انستیتو قلب و عروق شهید رجایی"
                classNames={{
                  content: "logo-tooltip-content",
                }}
                delay={0}
                closeDelay={0}
                motionProps={{
                  variants: {
                    exit: { opacity: 0, y: 5, transition: { duration: 0.1 } },
                    enter: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                  },
                }}
              >
                <img src={rajaeiLogo} alt="RAJAEI" className="title-logo" />
              </Tooltip>
              <Tooltip
                content=" معاونت تحقیقات و فناوری وزارت بهداشت درمان و آموزش پزشکی"
                classNames={{
                  content: "logo-tooltip-content",
                }}
                delay={0}
                closeDelay={0}
                motionProps={{
                  variants: {
                    exit: { opacity: 0, y: 5, transition: { duration: 0.1 } },
                    enter: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                  },
                }}
              >
                <img src={ministryLogo} alt="MINISTRY" className="title-logo" />
              </Tooltip>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default PrimaryContentContainer
