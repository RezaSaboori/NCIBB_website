/* CriteriaWindow.tsx */
import React, { useState, useRef, useEffect } from "react";
import { QuestionIcon, TrashIcon, MinimizeIcon, ChevronIcon } from "./icons/Step2Icons";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [dropdownOpen]);

  const isEnum = value_type === "enum" && Array.isArray(values) && values.length > 0;
  const isNumeric = value_type === "numeric";

  const buildPlaceholder = () => {
    if (isNumeric && value_min != null && value_max != null)
      return `Range: ${value_min} – ${value_max}`;
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
            <div
              className="s2-criteria-window__dropdown"
              ref={dropdownRef}
            >
              {/* Pill trigger — mirrors .s2-panel-header__search-box */}
              <div
                className={`s2-panel-header__search-box s2-criteria-window__input-pill${dropdownOpen ? " s2-criteria-window__input-pill--open" : ""}`}
                onClick={() => setDropdownOpen((o) => !o)}
                role="button"
                aria-expanded={dropdownOpen}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setDropdownOpen((o) => !o); }}
              >
                <span className={`s2-criteria-window__pill-text${!inputValue ? " s2-criteria-window__pill-text--placeholder" : ""}`}>
                  {inputValue || "Select value..."}
                </span>
                <button
                  className="glass dz-icon-btn s2-criteria-window__chevron-btn"
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <ChevronIcon
                    className={`dz-icon-btn__icon dz-icon-btn__icon--chevron${dropdownOpen ? " dz-icon-btn__icon--chevron-open" : ""}`}
                  />
                </button>
              </div>

              {/* Dropdown panel */}
              <div className={`s2-criteria-window__dropdown-panel${dropdownOpen ? " is-open" : ""}`}>
                <div className="s2-criteria-window__dropdown-list">
                  {values!.map((v) => (
                    <div
                      key={v}
                      className={`s2-criteria-window__dropdown-item${inputValue === v ? " is-selected" : ""}`}
                      onClick={() => { setInputValue(v); setDropdownOpen(false); }}
                      role="option"
                      aria-selected={inputValue === v}
                    >
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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