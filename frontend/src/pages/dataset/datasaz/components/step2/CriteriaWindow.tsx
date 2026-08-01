/* CriteriaWindow.tsx */
import React, { useState } from "react";
import { QuestionIcon, TrashIcon, MinimizeIcon } from "./icons/Step2Icons";
import { CriteriaWindowRow, RowState } from "./CriteriaWindowRow";
import { useScrollText } from "../../hooks/useScrollText";

interface CriteriaWindowProps {
  label: string;
  unit?: string;
  value_type?: "numeric" | "enum" | string;
  value_min?: number;
  value_max?: number;
  values?: string[];
  isAdvanced?: boolean;
  onToggleAdvanced?: () => void;
  onMinimize: () => void;
  onHelp?: () => void;
  onDelete: () => void;
  initialRows?: RowState[];
  onRowsChange?: (rows: RowState[]) => void;
}

let _rowIdCounter = 0;
const nextRowId = () => ++_rowIdCounter;

const makeRow = (): RowState => ({
  id: nextRowId(),
  inputValue: "",
  numericOperator: "=",
  isRequired: false,
});

export const CriteriaWindow: React.FC<CriteriaWindowProps> = ({
  label,
  unit,
  value_type,
  value_min,
  value_max,
  values,
  isAdvanced = false,
  onToggleAdvanced,
  onMinimize,
  onHelp,
  onDelete,
  initialRows,
  onRowsChange,
}) => {
  const titleRef = useScrollText<HTMLSpanElement>();
  const [rows, setRows] = useState<RowState[]>(() => initialRows && initialRows.length > 0 ? initialRows : [makeRow()]);

  const isEnum = value_type === "enum" && Array.isArray(values) && values.length > 0;
  const isNumeric = value_type === "numeric";

  const handleRowChange = (id: number, patch: Partial<RowState>) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
      onRowsChange?.(next);
      return next;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => {
      const next = [...prev, makeRow()];
      onRowsChange?.(next);
      return next;
    });
  };

  // Hide "Add more rule" if:
  //  - datatype is enum AND any row is marked required
  //  - datatype is enum AND all enum values are already covered (rows.length >= values.length)
  const showAddMoreRule = (() => {
    if (!isEnum) return true;
    if (rows.some((r) => r.isRequired)) return false;
    if (values && rows.length >= values.length) return false;
    return true;
  })();

  return (
    <div
      className={`${isAdvanced ? "opal-glass" : "glass"} dz-glass-container dz-glass-container--sm s2-criteria-window${isAdvanced ? " s2-criteria-window--advanced" : ""}`}
    >
      {/* Header */}
      <div className="dz-glass-container__header s2-criteria-window__header">
        <span ref={titleRef} className="s2-criteria-window__title dz-scroll-text">
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
        {rows.map((row) => (
          <CriteriaWindowRow
            key={row.id}
            row={row}
            isEnum={isEnum}
            isNumeric={isNumeric}
            values={values}
            value_min={value_min}
            value_max={value_max}
            onChange={handleRowChange}
            showDelete={rows.length > 1}
            onDelete={(id) => setRows((prev) => prev.filter((r) => r.id !== id))}
          />
        ))}

        {showAddMoreRule && (
          <button
            className="s2-criteria-window__add-rule-btn"
            type="button"
            onClick={handleAddRow}
          >
            <span className="s2-criteria-window__add-rule-btn-icon">+</span>
            Add more rule
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="s2-criteria-window__footer">
        <div className="s2-criteria-window__footer-left">
          <button className="blue-glass s2-criteria-window__btn" type="button" onClick={onMinimize}>
            Submit
          </button>
          <button className="red-glass s2-criteria-window__btn" type="button" onClick={onDelete}>
            Delete
          </button>
        </div>
        <button
          className={`${isAdvanced ? "glass" : "opal-glass"} s2-criteria-window__btn s2-criteria-window__btn--advanced${isAdvanced ? " s2-criteria-window__btn--advanced-active" : ""}`}
          type="button"
          onClick={onToggleAdvanced}
        >
          {isAdvanced ? "Enter Simple Mode" : "Enter Advanced Mode"}
        </button>
      </div>
    </div>
  );
};