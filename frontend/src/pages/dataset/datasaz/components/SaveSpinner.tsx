import React from "react";
import "../styles.css";

const BLADE_COUNT = 12;
const ANIMATION_PERIOD_S = 0.8;

interface SaveSpinnerProps {
  visible: boolean;
}

export const SaveSpinner: React.FC<SaveSpinnerProps> = ({ visible }) => (
  <span
    className={`dz-save-spinner${visible ? " dz-save-spinner--visible" : ""}`}
    role="status"
    aria-label="در حال ذخیره"
    aria-hidden={!visible}
  >
    {Array.from({ length: BLADE_COUNT }, (_, i) => (
      <span
        key={i}
        className="dz-save-spinner__blade"
        style={{
          transform: `rotate(${(360 / BLADE_COUNT) * i}deg)`,
          animationDelay: `${((i - BLADE_COUNT) * ANIMATION_PERIOD_S) / BLADE_COUNT}s`,
        }}
      />
    ))}
  </span>
);