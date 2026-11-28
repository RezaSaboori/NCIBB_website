import { motion } from "framer-motion";
import { useId } from "react";

export function DatasetGooSurface() {
  const id = useId();

  return (
    <motion.svg
      animate={{ opacity: 0 }}
      aria-hidden="true"
      className="dataset-progress__goo"
      exit={{ opacity: 0, transition: { duration: 0.05, ease: "easeOut" } }}
      focusable="false"
      initial={{ opacity: 1 }}
      preserveAspectRatio="none"
      transition={{ delay: 0.075, duration: 0.11, ease: "easeOut" }}
      viewBox="0 0 120 44"
    >
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="44"
          id={id}
          width="120"
          x="0"
          y="0"
        >
          <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="3.5" />
          <feColorMatrix
            in="blur"
            result="goo"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -15"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>
        <rect height="17" rx="8.5" width="90" x="15" y="1" />
        <motion.rect
          animate={{ scaleX: 0.58, y: 0 }}
          className="dataset-progress__tether"
          height="18"
          initial={{ scaleX: 1, y: -8 }}
          rx="9"
          transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
          width="104"
          x="8"
          y="22"
        />
      </g>
    </motion.svg>
  );
}
