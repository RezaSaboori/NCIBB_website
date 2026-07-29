/* CriteriaWindow.tsx */
import React, { useState } from "react";
import { QuestionIcon, TrashIcon, MinimizeIcon, ChevronIcon } from "./icons/Step2Icons";
import { TextInput, NumberInput, DropdownInput, RadioToggle } from "../../../../../components/ui/inputs";

const NUMERIC_OPERATORS = ["Equal", "Below and Equal", "Above and Equal", "Below", "Above"];

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
  const [numericOperator, setNumericOperator] = useState("Equal");
  const [isRequired, setIsRequired] = useState(false);

  const isEnum = value_type === "enum" && Array.isArray(values) && values.length > 0;
  const isNumeric = value_type === "numeric";

  const buildPlaceholder = () => {
    if (isNumeric && value_min != null && value_max != null)
      return `Range: ${value_min} – ${value_max}`;
    return "Enter value...";
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
            <DropdownInput
                value={inputValue}
                options={values!}
                onChange={setInputValue}
                placeholder="Select value..."
                chevronIcon={<ChevronIcon />}
                searchable={values!.length > 6}
              />
          ) : isNumeric ? (
            <div className="s2-criteria-window__numeric-row">
              <DropdownInput
                value={numericOperator}
                options={NUMERIC_OPERATORS}
                onChange={setNumericOperator}
                placeholder="Operator"
                chevronIcon={<ChevronIcon />}
                dir="ltr"
              />
              <NumberInput
                value={inputValue}
                onChange={setInputValue}
                placeholder={buildPlaceholder()}
                min={value_min}
                max={value_max}
              />
            </div>
          ) : (
            <TextInput
              value={inputValue}
              onChange={setInputValue}
              placeholder={buildPlaceholder()}
            />
          )}
          <RadioToggle checked={isRequired} onChange={setIsRequired} />
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