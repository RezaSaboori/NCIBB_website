/* CriteriaButton.tsx */
import React from "react";
import "./step2.css";
import { TrashIcon, ExpandIcon, MinimizeIcon } from "./icons/Step2Icons";
import { useScrollText } from "@/components/ui/motion/useScrollText";

interface CriteriaButtonProps {
  label?: string;
  isSelected?: boolean;
  isExpanded?: boolean;
  isAdvanced?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onExpand: () => void;
}

export const CriteriaButton: React.FC<CriteriaButtonProps> = ({
  label = "Criteria 1",
  isSelected = false,
  isExpanded = false,
  isAdvanced = false,
  onSelect,
  onDelete,
  onExpand,
}) => {
  const { wrapperRef, innerRef } = useScrollText<HTMLSpanElement, HTMLSpanElement>();

  return (
    <div
      className={`${isAdvanced ? "opal-glass" : "glass"} dz-criteria-tab s2-criteria-tab${isSelected ? " s2-criteria-tab--selected" : ""}${isAdvanced ? " s2-criteria-tab--advanced" : ""}`}
    >
      <button className="s2-criteria-tab__select" type="button" onClick={onSelect} aria-expanded={isSelected}>
        <span ref={wrapperRef} className="dz-criteria-tab__title dz-scroll-wrapper" dir="auto">
          <span ref={innerRef} className="dz-scroll-inner">{label}</span>
        </span>
      </button>
      <div className="dz-criteria-tab__actions s2-criteria-tab__actions" aria-hidden={!isSelected}>
        <button
          className={`${isExpanded ? "orange-glass" : "green-glass"} dz-icon-btn s2-icon-btn`}
          aria-label={`${isExpanded ? "Minimize" : "Expand"} ${label}`}
          onClick={onExpand}
          type="button"
          disabled={!isSelected}
        >
          {isExpanded
            ? <MinimizeIcon className="dz-icon-btn__icon dz-icon-btn__icon--minimize" />
            : <ExpandIcon className="dz-icon-btn__icon dz-icon-btn__icon--expand" />
          }
        </button>
        <button
          className="red-glass dz-icon-btn s2-icon-btn"
          aria-label={`Delete ${label}`}
          onClick={onDelete}
          type="button"
          disabled={!isSelected}
        >
          <TrashIcon className="dz-icon-btn__icon dz-icon-btn__icon--trash" />
        </button>
      </div>
    </div>
  );
};
