/* CriteriaWindow.tsx */
import React, { useState } from "react";
import { QuestionIcon, TrashIcon, MinimizeIcon } from "./icons/Step2Icons";
import { RequiredToggle } from "./RequiredToggle";

interface CriteriaWindowProps {
  label: string;
  unit?: string;
  value_type?: "numeric" | "enum" | string;
  value_min?: number;
  value_max?: number;
  values?: string[];
  onMinimize: () => void;
  onHelp?: () => void;
  onDelete: () => void;
}

export const CriteriaWindow: React.FC<CriteriaWindowProps> = ({
  label,
  unit,
  value_type,
  value_min,
  value_max,
  values,
  onMinimize,
  onHelp,
  onDelete,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  const isEnum = value_type === "enum" && Array.isArray(values) && values.length > 0;
  const isNumeric = value_type === "numeric";

  const buildPlaceholder = () => {
    if (isNumeric && value_min != null && value_max != null)
      return `${value_min} – ${value_max}`;
    return "Enter value...";
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow empty string while typing
    if (raw === "" || raw === "-") {
      setInputValue(raw);
      return;
    }
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    setInputValue(raw);
  };

  const handleNumericBlur = () => {
    if (inputValue === "" || inputValue === "-") return;
    const num = parseFloat(inputValue);
    if (isNaN(num)) return;
    if (value_min != null && num < value_min) setInputValue(String(value_min));
    else if (value_max != null && num > value_max) setInputValue(String(value_max));
  };

  return (
    <div className="glass dz-glass-container dz-glass-container--sm s2-criteria-window">
      {/* Header */}
      <div className="dz-glass-container__header s2-criteria-window__header">
        <span className="s2-criteria-window__title">
          {label}
          {unit && <span className="s2-criteria-window__unit">{unit}</span>}
        </span>
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
          {isEnum ? (
            <select
              className="glass s2-criteria-window__input s2-criteria-window__select"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            >
              <option value="">Select value...</option>
              {values!.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="glass s2-criteria-window__input"
              type={isNumeric ? "number" : "text"}
              value={inputValue}
              onChange={isNumeric ? handleNumericChange : (e) => setInputValue(e.target.value)}
              onBlur={isNumeric ? handleNumericBlur : undefined}
              placeholder={buildPlaceholder()}
              min={isNumeric && value_min != null ? value_min : undefined}
              max={isNumeric && value_max != null ? value_max : undefined}
              step={isNumeric ? "any" : undefined}
            />
          )}
          <RequiredToggle checked={isRequired} onChange={setIsRequired} />
        </div>
        {isNumeric && value_min != null && value_max != null && (
          <span className="s2-criteria-window__range-hint">
            Range: {value_min} – {value_max}
          </span>
        )}
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