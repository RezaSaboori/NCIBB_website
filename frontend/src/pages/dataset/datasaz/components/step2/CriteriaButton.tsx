/* CriteriaButton.tsx */
import React from "react";
import "./step2.css";

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
        <button
          className="glass s2-icon-btn s2-criteria-btn__action"
          aria-label="Delete"
          onClick={onDelete}
          type="button"
        >
          {/* Delete icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>

        <button
          className="glass s2-icon-btn s2-criteria-btn__action"
          aria-label="Help"
          onClick={onHelp}
          type="button"
        >
          {/* Help icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.3 8.8a3.8 3.8 0 1 1 7.4 1.2c0 2.2-3.7 3.1-3.7 5.4" />
            <line x1="12" y1="19" x2="12.01" y2="19" />
          </svg>
        </button>

        <button
          className="glass s2-icon-btn s2-criteria-btn__action"
          aria-label="Expand"
          onClick={onExpand}
          type="button"
        >
          {/* Expand icon */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      </div>
    </div>
  );
};