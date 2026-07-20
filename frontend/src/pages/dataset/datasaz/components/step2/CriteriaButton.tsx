/* CriteriaButton.tsx */
import React from "react";
import "./step2.css";
import { TrashIcon, QuestionIcon, ExpandIcon } from "./icons/Step2Icons";

interface CriteriaButtonProps {
  label?: string;
  onDelete?: () => void;
  onHelp?: () => void;
  onExpand?: () => void;
}

export const CriteriaButton: React.FC<CriteriaButtonProps> = ({
  label = "Criteria 1",
  onDelete,
  onHelp,
  onExpand,
}) => {
  return (
    <div className="glass dz-criteria-tab">
      <span className="dz-criteria-tab__title">{label}</span>
      <div className="dz-criteria-tab__actions">
        <button className="blue-glass dz-icon-btn s2-icon-btn" aria-label="Help" onClick={onHelp} type="button">
          <QuestionIcon className="dz-icon-btn__icon dz-icon-btn__icon--question" />
        </button>
        <button className="green-glass dz-icon-btn s2-icon-btn" aria-label="Expand" onClick={onExpand} type="button">
          <ExpandIcon className="dz-icon-btn__icon dz-icon-btn__icon--expand" />
        </button>
        <button className="red-glass dz-icon-btn s2-icon-btn" aria-label="Delete" onClick={onDelete} type="button">
          <TrashIcon className="dz-icon-btn__icon dz-icon-btn__icon--trash" />
        </button>
      </div>
    </div>
  );
};