/*CriteriaPanel.tsx*/
import React from "react";
import "./step2.css";
import { CriteriaButton } from "./CriteriaButton";

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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        <button className="glass s2-icon-btn s2-icon-btn--help" aria-label="Help">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.3 8.8a3.8 3.8 0 1 1 7.4 1.2c0 2.2-3.7 3.1-3.7 5.4" />
            <line x1="12" y1="19" x2="12.01" y2="19" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="dz-glass-container__body">
        <CriteriaButton label="Criteria 1" />
        <button className="blue-glass s2-add-btn">
          {btnLabel}
          <span className="glass-transparent s2-add-btn__icon">+</span>
        </button>
      </div>
    </div>
  );
};