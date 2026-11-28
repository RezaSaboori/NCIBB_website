import { useId } from "react";

import {
  smartSortOptions,
  sortOptions,
  type DatasetSort,
  type SmartDatasetSort,
} from "../datasetSearchOptions";

import { DropdownInput } from "@/components/ui/inputs";

type DatasetSortControlProps =
  | {
      smart: true;
      value: SmartDatasetSort;
      onChange: (value: SmartDatasetSort) => void;
    }
  | {
      smart?: false;
      value: DatasetSort;
      onChange: (value: DatasetSort) => void;
    };

export function DatasetSortControl(props: DatasetSortControlProps) {
  const id = useId();
  const options: readonly SmartDatasetSort[] = props.smart
    ? smartSortOptions
    : sortOptions;

  return (
    <div className="dataset-sort">
      <label htmlFor={id}>مرتب‌سازی بر اساس</label>
      <DropdownInput
        dir="rtl"
        id={id}
        options={options}
        value={props.value}
        onChange={(value) => {
          const selected = options.find((option) => option === value);

          if (!selected) return;
          if (props.smart) props.onChange(selected);
          else if (selected !== "شباهت") props.onChange(selected);
        }}
      />
    </div>
  );
}
