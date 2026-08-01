/* CriteriaWindowMini.tsx
 * A compact (--xs) criteria window used as a tab pane inside CriteriaWindowAdvanced.
 * Mirrors CriteriaWindow body+footer but:
 *   - uses dz-glass-container--xs
 *   - no "Enter Advanced Mode" button
 *   - header shows field label + unit + action icons
 */
import React, { useState } from "react";
import { QuestionIcon, TrashIcon, MinimizeIcon } from "./icons/Step2Icons";
import { CriteriaWindowRow, RowState } from "./CriteriaWindowRow";

interface CriteriaWindowMiniProps {
  label: string;
  unit?: string;
  value_type?: "numeric" | "enum" | string;
  value_min?: number;
  value_max?: number;
  values?: string[];
  onClose: () => void;
  onDelete: () => void;
  onHelp?: () => void;
}

let _miniRowIdCounter = 0;
const nextMiniRowId = () => ++_miniRowIdCounter;

const makeMiniRow = (): RowState => ({
  id: nextMiniRowId(),
  inputValue: "",
  numericOperator: "=",
  isRequired: false,
});

export const CriteriaWindowMini: React.FC<CriteriaWindowMiniProps> = ({
  label,
  unit,
  value_type,
  value_min,
  value_max,
  values,
  onClose,
  onDelete,
  onHelp,
}) => {
  const [rows, setRows] = useState<RowState[]>([makeMiniRow()]);

  const isEnum = value_type === "enum" && Array.isArray(values) && values.length > 0;
  const isNumeric = value_type === "numeric";

  const handleRowChange = (id: number, patch: Partial<RowState>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const showAddMoreRule = (() => {
    if (!isEnum) return true;
    if (rows.some((r) => r.isRequired)) return false;
    if (values && rows.length >= values.length) return false;
    return true;
  })();

  return (
    <div className="glass dz-glass-container dz-glass-container--xs s2-criteria-window s2-criteria-window--mini">
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
            aria-label="Close"
            onClick={onClose}
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
            onClick={() => setRows((prev) => [...prev, makeMiniRow()])}
          >
            <span className="s2-criteria-window__add-rule-btn-icon">+</span>
            Add more rule
          </button>
        )}
      </div>

      {/* Footer — Submit + Delete only, no Advanced toggle */}
      <div className="s2-criteria-window__footer">
        <div className="s2-criteria-window__footer-left">
          <button className="blue-glass s2-criteria-window__btn" type="button" onClick={onClose}>
            Submit
          </button>
          <button className="red-glass s2-criteria-window__btn" type="button" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};