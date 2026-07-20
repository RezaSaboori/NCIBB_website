/*CriteriaPanel.tsx*/
import React from "react";
import "./step2.css";

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
    <div className="glass dz-glass-container dz-glass-container--lg">
      {/* Header */}
      <div className="dz-glass-container__header">
        <span className={`s2-panel-header__title ${titleClass}`}>{title}</span>
        <div className="s2-panel-header__search">
          <div className="glass s2-panel-header__search-box" style={{ display: "flex", alignItems: "center", flex: 1, borderRadius: "var(--border-radius-pill)", padding: "var(--spacing-xs) var(--spacing-sm)" }}>
            <input
              className="s2-search-input"
              type="text"
              placeholder="Search Imported Criteria"
              disabled
            />
            <button className="glass" style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "1.75rem", height: "1.75rem", borderRadius: "50%", flexShrink: 0 }} aria-label="Search">
              {/* Search icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
          <button className="glass" style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "1.75rem", height: "1.75rem", borderRadius: "50%", flexShrink: 0 }} aria-label="Help">
            {/* Help icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="dz-glass-container__body">
        <button className="blue-glass s2-add-btn">
          {btnLabel}
          <span className="glass-transparent s2-add-btn__icon">+</span>
        </button>
      </div>
    </div>
  );
};