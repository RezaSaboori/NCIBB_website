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
    <div className="glass s2-criteria-btn">
      <span className="s2-criteria-btn__label">{label}</span>
      <div className="s2-criteria-btn__actions">

        <button className="blue-glass dz-icon-btn s2-icon-btn s2-criteria-btn__action" aria-label="Help" onClick={onHelp} type="button">
          <QuestionIcon className="dz-icon-btn__icon dz-icon-btn__icon--question" />
        </button>
        <button className="orange-glass dz-icon-btn s2-icon-btn s2-criteria-btn__action" aria-label="Expand" onClick={onExpand} type="button">
          <ExpandIcon className="dz-icon-btn__icon dz-icon-btn__icon--expand" />
        </button>
        <button className="red-glass dz-icon-btn s2-icon-btn s2-criteria-btn__action" aria-label="Delete" onClick={onDelete} type="button">
          <TrashIcon className="dz-icon-btn__icon dz-icon-btn__icon--trash" />
        </button>

      </div>
    </div>
  );
};