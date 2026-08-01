/* CriteriaButton.tsx */
import React from "react";
import "./step2.css";
import { TrashIcon, QuestionIcon, ExpandIcon, MinimizeIcon } from "./icons/Step2Icons";
import { useScrollText } from "../../hooks/useScrollText";

interface CriteriaButtonProps {
  label?: string;
  isSelected?: boolean;
  isExpanded?: boolean;
  isAdvanced?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onHelp?: () => void;
  onExpand?: () => void;
}

export const CriteriaButton: React.FC<CriteriaButtonProps> = ({
  label = "Criteria 1",
  isSelected = false,
  isExpanded = false,
  isAdvanced = false,
  onSelect,
  onDelete,
  onHelp,
  onExpand,
}) => {
  const { wrapperRef, innerRef } = useScrollText<HTMLSpanElement, HTMLSpanElement>();

  const handleActionClick = (e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation();
    callback?.();
  };

  return (
    <div
      className={`${isAdvanced ? "opal-glass" : "glass"} dz-criteria-tab s2-criteria-tab${isSelected ? " s2-criteria-tab--selected" : ""}${isAdvanced ? " s2-criteria-tab--advanced" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.()}
    >
      <span ref={wrapperRef} className="dz-criteria-tab__title dz-scroll-wrapper">
        <span ref={innerRef} className="dz-scroll-inner">{label}</span>
      </span>
      <div className="dz-criteria-tab__actions s2-criteria-tab__actions">
        <button
          className="teal-glass dz-icon-btn s2-icon-btn"
          aria-label="Help"
          onClick={(e) => handleActionClick(e, onHelp)}
          type="button"
          tabIndex={isSelected ? 0 : -1}
        >
          <QuestionIcon className="dz-icon-btn__icon dz-icon-btn__icon--question" />
        </button>
        <button
          className={`${isExpanded ? "orange-glass" : "green-glass"} dz-icon-btn s2-icon-btn`}
          aria-label={isExpanded ? "Minimize" : "Expand"}
          onClick={(e) => handleActionClick(e, onExpand)}
          type="button"
          tabIndex={isSelected ? 0 : -1}
        >
          {isExpanded
            ? <MinimizeIcon className="dz-icon-btn__icon dz-icon-btn__icon--minimize" />
            : <ExpandIcon className="dz-icon-btn__icon dz-icon-btn__icon--expand" />
          }
        </button>
        <button
          className="red-glass dz-icon-btn s2-icon-btn"
          aria-label="Delete"
          onClick={(e) => handleActionClick(e, onDelete)}
          type="button"
          tabIndex={isSelected ? 0 : -1}
        >
          <TrashIcon className="dz-icon-btn__icon dz-icon-btn__icon--trash" />
        </button>
      </div>
    </div>
  );
};