/* CriteriaWindow.tsx */
import React, { useState } from "react";
import { QuestionIcon, TrashIcon, MinimizeIcon } from "./icons/Step2Icons";
import { RequiredToggle } from "./RequiredToggle";

interface CriteriaWindowProps {
  label: string;
  onMinimize: () => void;
  onHelp?: () => void;
  onDelete: () => void;
}

export const CriteriaWindow: React.FC<CriteriaWindowProps> = ({
  label,
  onMinimize,
  onHelp,
  onDelete,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  return (
    <div className="glass dz-glass-container dz-glass-container--sm s2-criteria-window">
      {/* Header */}
      <div className="dz-glass-container__header s2-criteria-window__header">
        <span className="s2-criteria-window__title">{label}</span>
        <div className="s2-criteria-window__header-actions">
          <button
            className="teal-glass dz-icon-btn s2-icon-btn"
            aria-label="Help"
            onClick={onHelp}
            type="button"
          >
            <QuestionIcon className="dz-icon-btn__icon dz-icon-btn__icon--question" />
          </button>
          <button
            className="orange-glass dz-icon-btn s2-icon-btn"
            aria-label="Minimize"
            onClick={onMinimize}
            type="button"
          >
            <MinimizeIcon className="dz-icon-btn__icon dz-icon-btn__icon--minimize" />
          </button>
          <button
            className="red-glass dz-icon-btn s2-icon-btn"
            aria-label="Delete"
            onClick={onDelete}
            type="button"
          >
            <TrashIcon className="dz-icon-btn__icon dz-icon-btn__icon--trash" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="dz-glass-container__body s2-criteria-window__body">
        <div className="s2-criteria-window__row">
          <input
            className="glass s2-criteria-window__input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value..."
          />
          <RequiredToggle checked={isRequired} onChange={setIsRequired} />
        </div>
      </div>

      {/* Footer */}
      <div className="s2-criteria-window__footer">
        <button className="blue-glass s2-criteria-window__btn" type="button" onClick={onMinimize}>
          Submit
        </button>
        <button className="red-glass s2-criteria-window__btn" type="button" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};