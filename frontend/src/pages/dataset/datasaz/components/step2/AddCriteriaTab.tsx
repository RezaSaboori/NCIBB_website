/* AddCriteriaTab.tsx */
import React from "react";
import "./step2.css";
import { AddIcon } from "./icons/Step2Icons";

interface AddCriteriaTabProps {
  label: string;
  onClick?: () => void;
}

export const AddCriteriaTab: React.FC<AddCriteriaTabProps> = ({ label, onClick }) => {
  return (
    <button
      type="button"
      className="blue-glass dz-criteria-tab s2-add-criteria-tab"
      onClick={onClick}
      aria-label={label}
    >
      <span className="dz-criteria-tab__title s2-add-criteria-tab__title">{label}</span>
      <div className="dz-criteria-tab__actions">
        <span className="glass-transparent dz-icon-btn s2-add-criteria-tab__icon">
          <AddIcon className="dz-icon-btn__icon dz-icon-btn__icon--add" />
        </span>
      </div>
    </button>
  );
};