export type DatasazStep = 1 | 2 | 3 | 4;

export interface DatasazStepConfig {
  id: DatasazStep;
  label: string;
}

export interface SuggestionItem {
  code: string;
  name: string;
  value_type: "numeric" | "enum";
  unit?: string;
  min?: number;
  max?: number;
  values?: string[];
  is_leaf: boolean;
  path: string[];
}

export interface AutocompleteResponse {
  query: string;
  mode: string;
  count: number;
  results: SuggestionItem[];
  elapsed_ms: number;
}

export interface CriteriaItem {
  id: number;
  label: string;
  unit?: string;
  value_type?: "numeric" | "enum" | string;
  value_min?: number;
  value_max?: number;
  values?: string[];
  /** Owned by CriteriaPanel; only relevant when in advanced mode */
  groupName?: string;
  isGroupRequired?: boolean;
}

export interface AdvancedCriteriaEntry extends CriteriaItem {
  /** unique within the group */
  entryId: number;
}

export interface AdvancedGroup {
  groupName: string;
  isRequired: boolean;
  entries: AdvancedCriteriaEntry[];
}

export interface DefinitionSummary {
  inclusionCount: number;
  exclusionCount: number;
  errorCount: number;
}

/** Serializable mirror of CriteriaWindowRow's RowState (kept here so types.ts doesn't import a component) */
export interface SerializedRow {
  id: number;
  inputValue: string;
  numericOperator: string;
  isRequired: boolean;
}

export interface SerializedAdvancedEntry {
  entryId: number;
  id: number;
  label: string;
  unit?: string;
  value_type?: "numeric" | "enum" | string;
  value_min?: number;
  value_max?: number;
  values?: string[];
  rows: SerializedRow[];
}

export interface SerializedCriteriaItem {
  id: number;
  label: string;
  unit?: string;
  value_type?: "numeric" | "enum" | string;
  value_min?: number;
  value_max?: number;
  values?: string[];
  mode: "simple" | "advanced";
  rows: SerializedRow[];
  groupName?: string;
  isGroupRequired?: boolean;
  entries?: SerializedAdvancedEntry[];
}

export type Step2DefinitionPayload = {
  inclusion: SerializedCriteriaItem[];
  exclusion: SerializedCriteriaItem[];
};