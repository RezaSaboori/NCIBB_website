/* RequiredToggle.tsx */
import React from "react";

interface RequiredToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const RequiredToggle: React.FC<RequiredToggleProps> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      className={`s2-required-toggle${checked ? " s2-required-toggle--checked" : ""}`}
      onClick={() => onChange(!checked)}
      aria-label="Required"
      aria-pressed={checked}
    >
      <span className={`s2-required-toggle__dot ${checked ? "red-glass" : "glass"}`} />
      <span className="s2-required-toggle__label">Required ?</span>
    </button>
  );
};