import React from "react";
import { TextInput, NumberInput, DropdownInput, RadioToggle } from "../../../../../components/ui/inputs";
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
}

export const CriteriaWindowRow: React.FC<CriteriaWindowRowProps> = ({
  row,
  isEnum,
  isNumeric,
  values,
  value_min,
  value_max,
  onChange,
}) => {
  const buildPlaceholder = () => {
    if (isNumeric && value_min != null && value_max != null)
      return `Range: ${value_min} – ${value_max}`;
    return "Enter value...";
  };

  return (
    <div className="s2-criteria-window__row">
      {isEnum ? (
        <DropdownInput
          value={row.inputValue}
          options={values!}
          onChange={(v) => onChange(row.id, { inputValue: v })}
          placeholder="Select value..."
          chevronIcon={<ChevronIcon />}
          searchable={values!.length > 6}
        />
      ) : isNumeric ? (
        <div className="s2-criteria-window__numeric-row">
          <DropdownInput
            value={row.numericOperator}
            options={NUMERIC_OPERATORS}
            onChange={(v) => onChange(row.id, { numericOperator: v })}
            placeholder="Operator"
            chevronIcon={<ChevronIcon />}
            dir="ltr"
          />
          <NumberInput
            value={row.inputValue}
            onChange={(v) => onChange(row.id, { inputValue: v })}
            placeholder={buildPlaceholder()}
            min={value_min}
            max={value_max}
          />
        </div>
      ) : (
        <TextInput
          value={row.inputValue}
          onChange={(v) => onChange(row.id, { inputValue: v })}
          placeholder={buildPlaceholder()}
        />
      )}
      <RadioToggle
        checked={row.isRequired}
        onChange={(v) => onChange(row.id, { isRequired: v })}
      />
    </div>
  );
};