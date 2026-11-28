/* AddCriteriaTab.tsx */
import React from "react";
import "./step2.css";
import { AddIcon } from "./icons/Step2Icons";

interface AddCriteriaTabProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const AddCriteriaTab: React.FC<AddCriteriaTabProps> = ({ label, isActive = false, onClick }) => {
  return (
    <button
      type="button"
      className={`dz-criteria-tab s2-add-criteria-tab${isActive ? " s2-add-criteria-tab--active" : ""}`}
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      lang="en"
    >
      <span className="blue-glass s2-add-criteria-tab__surface">
        <span className="s2-add-criteria-tab__title">{label}</span>
        <span className="blue-glass-transparent dz-icon-btn s2-add-criteria-tab__icon" aria-hidden="true">
          <AddIcon className="dz-icon-btn__icon" />
        </span>
      </span>
    </button>
  );
};
