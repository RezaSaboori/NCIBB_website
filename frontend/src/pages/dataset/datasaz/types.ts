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
}

export interface DefinitionSummary {
  inclusionCount: number;
  exclusionCount: number;
  errorCount: number;
}