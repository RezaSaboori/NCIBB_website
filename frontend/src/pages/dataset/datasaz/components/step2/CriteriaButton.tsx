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

        <button className="blue-glass s2-icon-btn s2-criteria-btn__action" aria-label="Help" onClick={onHelp} type="button">
          <QuestionIcon width={13} height={13} />
        </button>
        <button className="orange-glass s2-icon-btn s2-criteria-btn__action" aria-label="Expand" onClick={onExpand} type="button">
          <ExpandIcon width={14} height={14} />
        </button>
        <button className="red-glass s2-icon-btn s2-criteria-btn__action" aria-label="Delete" onClick={onDelete} type="button">
          <TrashIcon width={14} height={14} />
        </button>

      </div>
    </div>
  );
};