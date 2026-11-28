import React, { useId } from "react";
import { TextInput, NumberInput, DropdownInput, RadioToggle } from "../../../../../components/ui/inputs";
import { DeleteButton } from "@/components/ui/iconButtons";
import { ChevronIcon } from "./icons/Step2Icons";

const NUMERIC_OPERATORS = ["=", "<", ">", "<=", ">="];

export interface RowState {
  id: number;
  inputValue: string;
  numericOperator: string;
  isRequired: boolean;
}

interface CriteriaWindowRowProps {
  row: RowState;
  isEnum: boolean;
  isNumeric: boolean;
  values?: string[];
  value_min?: number;
  value_max?: number;
  onChange: (id: number, patch: Partial<RowState>) => void;
  showDelete?: boolean;
  onDelete?: (id: number) => void;
}

export const CriteriaWindowRow: React.FC<CriteriaWindowRowProps> = ({
  row,
  isEnum,
  isNumeric,
  values,
  value_min,
  value_max,
  onChange,
  showDelete = false,
  onDelete,
}) => {
  const valueId = useId();
  const operatorId = useId();
  const buildPlaceholder = () => {
    if (isNumeric && value_min != null && value_max != null)
      return `Range: ${value_min} – ${value_max}`;
    return "Enter value...";
  };

  return (
    <div className="s2-criteria-window__row">
      {isNumeric && (
        <div className="s2-criteria-window__operator" dir="ltr">
          <label className="s2-rule-label" htmlFor={operatorId} lang="en">Operator</label>
          <DropdownInput
            id={operatorId}
            value={row.numericOperator}
            options={NUMERIC_OPERATORS}
            onChange={(v) => onChange(row.id, { numericOperator: v })}
            placeholder="Operator"
            chevronIcon={<ChevronIcon />}
            dir="ltr"
          />
        </div>
      )}
      <div className="s2-criteria-window__field">
        <label className="s2-rule-label" htmlFor={valueId} lang="en" dir="ltr">Value</label>
        {isEnum ? (
          <DropdownInput
            id={valueId}
            value={row.inputValue}
            options={values ?? []}
            onChange={(v) => onChange(row.id, { inputValue: v })}
            placeholder="Select value..."
            chevronIcon={<ChevronIcon />}
          />
        ) : isNumeric ? (
          <NumberInput
            id={valueId}
            value={row.inputValue}
            onChange={(v) => onChange(row.id, { inputValue: v })}
            placeholder={buildPlaceholder()}
            min={value_min}
            max={value_max}
            dir="ltr"
          />
        ) : (
          <TextInput
            id={valueId}
            value={row.inputValue}
            onChange={(v) => onChange(row.id, { inputValue: v })}
            placeholder={buildPlaceholder()}
          />
        )}
      </div>
      <RadioToggle
        checked={row.isRequired}
        onChange={(v) => onChange(row.id, { isRequired: v })}
      />
      {showDelete && (
        <DeleteButton
          size="var(--s2-criteria-action-target)"
          className="s2-criteria-icon"
          inset
          aria-label="Delete rule"
          onClick={() => onDelete?.(row.id)}
        />
      )}
    </div>
  );
};
