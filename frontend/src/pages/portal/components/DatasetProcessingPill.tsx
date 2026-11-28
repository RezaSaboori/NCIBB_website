import { motion, type Variants } from "framer-motion";
import { useLayoutEffect, useState, type RefObject } from "react";

import { DatasetGooSurface } from "./DatasetGooSurface";

import { MotionSwap } from "@/components/ui/motion/MotionSwap";
import { fadeMotion } from "@/components/ui/motion/motionPresets";
import { useReducedMotionPreference } from "@/components/ui/motion/useReducedMotionPreference";

const surfaceDuration = 0.24;
const revealOverlap = 0.048;
const settleEase = [0.2, 0.8, 0.2, 1] as const;
const surfaceTransition = { duration: surfaceDuration, ease: settleEase };

const layoutMotion: Variants = {
  attached: { height: 0 },
  rest: { height: "auto", transition: surfaceTransition },
  dismissed: {
    height: 0,
    transition: { delay: 0.035, duration: 0.15, ease: settleEase },
  },
};

const reducedLayout: Variants = {
  enter: { height: "auto", transition: { duration: 0 } },
  exit: { height: 0, transition: { duration: 0 } },
};

const surfaceMotion: Variants = {
  attached: { y: -16, scaleX: 0.96, scaleY: 0.9, opacity: 0 },
  rest: {
    y: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    transition: {
      ...surfaceTransition,
      opacity: { duration: 0.11, ease: "easeOut" },
    },
  },
  dismissed: (_custom, current) => ({
    y: Math.min(Number(current.y ?? 0), -5),
    scaleX: Math.min(Number(current.scaleX ?? 1), 0.98),
    scaleY: Math.min(Number(current.scaleY ?? 1), 0.96),
    opacity: 0,
    transition: {
      duration: 0.14,
      delay: 0.025,
      ease: settleEase,
      opacity: { delay: 0.045, duration: 0.095, ease: "easeOut" },
    },
  }),
};

const itemMotion: Variants = {
  attached: { opacity: 0, scale: 0.98, filter: "blur(2px) brightness(1.18)" },
  rest: (_custom, current) => {
    const delay = Number(current.opacity ?? 0) > 0 ? 0 : surfaceDuration - revealOverlap;

    return {
      opacity: 1,
      scale: 1,
      filter: "blur(0px) brightness(1)",
      transition: {
        delay,
        duration: 0.14,
        ease: settleEase,
        opacity: { delay, duration: 0.095, ease: "easeOut" },
      },
      transitionEnd: { filter: "none" },
    };
  },
  dismissed: {
    opacity: 0,
    scale: 0.99,
    filter: "blur(1.5px) brightness(1)",
    transition: { duration: 0.075, ease: "easeOut" },
  },
};

interface DatasetProcessingPillProps {
  label: string;
  detail?: string;
  searchShellRef: RefObject<HTMLSpanElement>;
}

export function DatasetProcessingPill({
  label,
  detail,
  searchShellRef,
}: DatasetProcessingPillProps) {
  const reduceMotion = useReducedMotionPreference();
  const [height, setHeight] = useState<number>();
  const statusKey = JSON.stringify([label, detail]);

  useLayoutEffect(() => {
    const field = searchShellRef.current;

    if (!field) return;
    const measure = () => setHeight(field.getBoundingClientRect().height);

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);

    observer.observe(field);

    return () => observer.disconnect();
  }, [searchShellRef]);

  return (
    <motion.div
      animate={reduceMotion ? "enter" : "rest"}
      aria-hidden="true"
      className="dataset-progress"
      exit={reduceMotion ? "exit" : "dismissed"}
      initial={reduceMotion ? "enter" : "attached"}
      variants={reduceMotion ? reducedLayout : layoutMotion}
    >
      <div className="dataset-progress__frame">
        <div className="dataset-progress__shapes">
          {!reduceMotion && <DatasetGooSurface />}
          <motion.span
            animate={reduceMotion ? "enter" : "rest"}
            className="dataset-progress__pill ui-input-shell"
            exit={reduceMotion ? "exit" : "dismissed"}
            initial={reduceMotion ? "exit" : "attached"}
            variants={reduceMotion ? fadeMotion : surfaceMotion}
          />
        </div>
        <motion.div
          animate={reduceMotion ? "enter" : "rest"}
          className="dataset-progress__content"
          exit={reduceMotion ? "exit" : "dismissed"}
          initial={reduceMotion ? "exit" : "attached"}
          style={{ blockSize: height }}
          variants={reduceMotion ? fadeMotion : itemMotion}
        >
          <MotionSwap value={statusKey}>
            <span className="dataset-progress__text">
              <span className="dataset-progress__label" dir="auto">
                {label}
              </span>
              {detail && (
                <span className="dataset-progress__detail" dir="auto">
                  {detail}
                </span>
              )}
            </span>
          </MotionSwap>
        </motion.div>
      </div>
    </motion.div>
  );
}
