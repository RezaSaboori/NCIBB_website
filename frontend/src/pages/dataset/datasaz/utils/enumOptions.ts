import type { EnumValues } from "../types";

/**
 * Give the dropdown human-readable labels while leaving the original
 * label-to-concept-ID map intact for saving and later query construction.
 */
export function getEnumOptions(values?: EnumValues | null): string[] {
  if (Array.isArray(values)) return values;
  return Object.keys(values ?? {});
}