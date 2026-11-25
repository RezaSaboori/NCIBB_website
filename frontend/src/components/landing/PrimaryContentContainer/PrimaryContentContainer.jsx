import React from "react"
import { Tooltip } from "@heroui/react"
import { motion } from "framer-motion"
import { useSelector } from "react-redux"
import RotatingBorderButton from "../RotatingBorderButton/RotatingBorderButton"
import AuroraButtonContent from "../AuroraButtonContent/AuroraButtonContent"
import cticiLogo from "./assets/ctici.svg"
import ministryLogo from "./assets/ministry.svg"
import rajaeiLogo from "./assets/RAJAEI.svg"
import "./PrimaryContentContainer.css"

const PrimaryContentContainer = ({
  scrollProgress,
  animated,
  auroraVisible,
  introRef,
}) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1)
  const firstPageProgress = Math.min(
    Math.max((clampedProgress - 0.1) / 0.4, 0),
    1
  )
  const firstPageOpacity = Math.max(0, 1 - firstPageProgress)

  const containerStyle = animated ? {
    transform: `translateY(${-Math.min(clampedProgress * 6, 10)}vh)`,
    opacity: firstPageOpacity,
    visibility: firstPageOpacity > 0.05 ? "visible" : "hidden",
  } : undefined

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
    <div className="primary-content-wrapper" style={containerStyle} ref={introRef}>
      <motion.div
        className="primary-content-container"
        initial={animated ? "hidden" : false}
        animate={animated ? "visible" : { opacity: 1, y: 0, transition: { duration: 0 } }}
        variants={animated ? containerVariants : undefined}
      >
        <motion.h1 className="primary-content-title" variants={animated ? itemVariants : undefined}>
          <span className="justified-title">
            <span>بانـک</span>{" "}
            <span>ملـی</span>{" "}
            <span>زیسـت</span>{" "}
            <span>داده</span>
          </span>{" "}
          <span className="justified-title">
            <span>یکپـارچـه</span>{" "}
            <span>قلـب</span>{" "}
            <span>و</span>{" "}
            <span>عـروق</span>
          </span>
        </motion.h1>
        <div className="primary-content-subtitle-container">
          <motion.p
            className="primary-content-description"
            variants={animated ? itemVariants : undefined}
          >
            <strong>از داده خام تا تحلیل نهایی</strong> | ما با جمع آوری داده
            های سلامت موجود بصورت یکپارچه، منبعی ارزشمند را برای محققین قلب و
            عـروق بوجـود آورده ایـم.
          </motion.p>
          <motion.div
            className="primary-content-buttons"
            variants={animated ? itemVariants : undefined}
          >
            <div className="primary-content-buttons-group">
              {!isAuthenticated && (
                <RotatingBorderButton variant="secondary" to="/login" animated={animated}>
                  <span className="button-text-secondary">وارد شوید</span>
                </RotatingBorderButton>
              )}

              <RotatingBorderButton variant="primary" to={isAuthenticated ? "/profile" : "/signup"} animated={animated}>
                <AuroraButtonContent visible={auroraVisible} />
                <span className="button-text-primary">
                  {isAuthenticated ? "داشبورد" : "ثبت‌نام کنید"}
                </span>
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
                <img src={cticiLogo} alt="مرکز فناوری و نوآوری انفرماتیک و قلب و عروق" className="title-logo" />
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
                <img src={rajaeiLogo} alt="انستیتو قلب و عروق شهید رجایی" className="title-logo" />
              </Tooltip>
              <Tooltip
                content="معاونت تحقیقات و فناوری وزارت بهداشت درمان و آموزش پزشکی"
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
                <img src={ministryLogo} alt="معاونت تحقیقات و فناوری وزارت بهداشت درمان و آموزش پزشکی" className="title-logo" />
              </Tooltip>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default PrimaryContentContainer
