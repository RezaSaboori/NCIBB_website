/*CriteriaPanel.tsx*/
import React from "react";
import "./step2.css";
import { CriteriaButton } from "./CriteriaButton";
import { SearchIcon, AddIcon, QuestionIcon } from "./icons/Step2Icons";

interface CriteriaPanelProps {
  type: "inclusion" | "exclusion";
}

export const CriteriaPanel: React.FC<CriteriaPanelProps> = ({ type }) => {
  const isInclusion = type === "inclusion";

  const titleClass = isInclusion
    ? "s2-panel-header__title--inclusion"
    : "s2-panel-header__title--exclusion";

  const title = isInclusion ? "Inclusion Criteria" : "Exclusion Criteria";
  const btnLabel = isInclusion ? "Add inclusion criteria" : "Add exclusion criteria";

  return (
    <div className="glass dz-glass-container dz-glass-container--md s2-criteria-panel">
      {/* Header */}
      <div className="dz-glass-container__header">
        <span className={`s2-panel-header__title ${titleClass}`}>{title}</span>

        <div className="s2-panel-header__search">
          <div className="s2-panel-header__search-box">
            <input
              className="s2-search-input"
              type="text"
              placeholder="Search Imported Criteria"
              disabled
            />
            <button className="glass s2-icon-btn s2-icon-btn--search" aria-label="Search">
              <SearchIcon />
            </button>
          </div>
        </div>

        <button className="glass s2-icon-btn s2-icon-btn--help" aria-label="Help">
          <QuestionIcon />
        </button>
      </div>

      {/* Tabs */}
      <div className="s2-criteria-tabs">
        <CriteriaButton label="Criteria 1" />
        <button className="blue-glass s2-add-btn">
          {btnLabel}
          <span className="glass-transparent s2-add-btn__icon"><AddIcon width={10} height={10} /></span>
        </button>
      </div>

      {/* Body */}
      <div className="dz-glass-container__body">
      </div>
    </div>
  );
};