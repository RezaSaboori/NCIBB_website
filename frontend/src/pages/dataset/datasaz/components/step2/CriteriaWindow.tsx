/* CriteriaWindow.tsx */
import React, { useState } from "react";
import { DeleteButton, MinimizeButton } from "@/components/ui/iconButtons";
import { CriteriaDescriptionHelp } from "./CriteriaDescriptionHelp";
import { CriteriaWindowButton } from "./CriteriaWindowButton";
import { CriteriaWindowRow, RowState } from "./CriteriaWindowRow";
import { AddIcon } from "./icons/Step2Icons";
import type { EnumValues } from "../../types";
import { getEnumOptions } from "../../utils/enumOptions";
import { ScrollText } from "@/components/ui/motion/ScrollText";

interface CriteriaWindowProps {
  label: string;
  description?: string | null;
  unit?: string;
  value_type?: "numeric" | "enum" | string;
  value_min?: number;
  value_max?: number;
  values?: EnumValues | null;
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
  description,
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
  const [rows, setRows] = useState<RowState[]>(() => {
    const init = initialRows && initialRows.length > 0 ? initialRows : [makeRow()];
    // Keep the module row-id counter ahead of restored ids to prevent key collisions
    const maxId = Math.max(...init.map((r) => r.id));
    if (maxId > _rowIdCounter) _rowIdCounter = maxId;
    return init;
  });

  const enumOptions = getEnumOptions(values);
  // Enum fields always use a dropdown, even when no choices are available.
  const isEnum = value_type === "enum";
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
        <ScrollText className="s2-criteria-window__title" text={label} focusable
          suffix={unit && <span className="s2-criteria-window__unit">{unit}</span>} />
        <div className="s2-criteria-window__header-actions">
          <CriteriaDescriptionHelp
            label={label}
            description={description}
            onOpen={onHelp}
          />
          <MinimizeButton
            size="var(--s2-criteria-action-target)"
            className="s2-criteria-icon"
            inset
            aria-label="Minimize"
            onClick={onMinimize}
          />
          <DeleteButton
            size="var(--s2-criteria-action-target)"
            className="s2-criteria-icon"
            inset
            aria-label="Delete"
            onClick={onDelete}
          />
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
            values={enumOptions}
            value_min={value_min}
            value_max={value_max}
            onChange={handleRowChange}
            showDelete={rows.length > 1}
            onDelete={(id) =>
              setRows((prev) => {
                const next = prev.filter((r) => r.id !== id);
                onRowsChange?.(next);
                return next;
              })
            }
          />
        ))}

        {showAddMoreRule && (
          <button
            className="s2-criteria-window__add-rule-btn"
            type="button"
            onClick={handleAddRow}
          >
            <span className="s2-criteria-window__add-rule-btn-icon" aria-hidden="true"><AddIcon /></span>
            Add more rule
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="s2-criteria-window__footer">
        <div className="s2-criteria-window__footer-left">
          <CriteriaWindowButton surface="blue-glass" onClick={onMinimize}>
            Submit
          </CriteriaWindowButton>
          <CriteriaWindowButton surface="red-glass" onClick={onDelete}>
            Delete
          </CriteriaWindowButton>
        </div>
        <CriteriaWindowButton surface={isAdvanced ? "glass" : "opal-glass"} onClick={onToggleAdvanced}>
          {isAdvanced ? "Enter Simple Mode" : "Enter Advanced Mode"}
        </CriteriaWindowButton>
      </div>
    </div>
  );
};
