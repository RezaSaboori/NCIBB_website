/*CriteriaPanel.tsx*/
import React from "react";
import "./step2.css";
import { CriteriaButton } from "./CriteriaButton";
import { AddCriteriaTab } from "./AddCriteriaTab";
import { SearchIcon, QuestionIcon } from "./icons/Step2Icons";

interface CriteriaPanelProps {
  type: "inclusion" | "exclusion";
}

export const CriteriaPanel: React.FC<CriteriaPanelProps> = ({ type }) => {
  const isInclusion = type === "inclusion";

  const titleClass = isInclusion
    ? "s2-panel-header__title--inclusion"
    : "s2-panel-header__title--exclusion";

  const title = isInclusion ? "Inclusion Criteria" : "Exclusion Criteria";
  const btnLabel = isInclusion ? "Add inclusion" : "Add exclusion";

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
            <button className="glass dz-icon-btn s2-icon-btn s2-icon-btn--search" aria-label="Search">
              <SearchIcon className="dz-icon-btn__icon dz-icon-btn__icon--search" />
            </button>
          </div>
        </div>

        <button className="glass dz-icon-btn s2-icon-btn s2-icon-btn--help" aria-label="Help">
          <QuestionIcon className="dz-icon-btn__icon dz-icon-btn__icon--question" />
        </button>
      </div>

      {/* Tabs */}
      <div className="dz-criteria-tabs">
        <CriteriaButton label="Criteria 1" />
        <CriteriaButton label="Criteria 2" />
        <CriteriaButton label="Criteria 3" />
        <CriteriaButton label="Criteria 4" />
        <CriteriaButton label="Criteria 5" />
        <CriteriaButton label="Criteria 6" />
        <CriteriaButton label="Criteria 7" />
        <CriteriaButton label="Criteria 8" />
        <CriteriaButton label="Criteria 9" />
        <CriteriaButton label="Criteria 10" />
        <AddCriteriaTab label={btnLabel} />
      </div>

      {/* Body */}
      <div className="dz-glass-container__body">
      </div>
    </div>
  );
};