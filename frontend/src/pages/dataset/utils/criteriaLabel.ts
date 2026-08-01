/**
 * Given a base field name and the set of labels already in use,
 * returns the lowest-numbered unique label:
 *   - base        if base is not taken
 *   - base (1)    if base is taken but base (1) is free
 *   - base (2)    if base and base (1) are taken, etc.
 *
 * Numbers fill from the lowest available gap, never leaving holes.
 */
export function resolveCriteriaLabel(base: string, existingLabels: Set<string>): string {
  if (!existingLabels.has(base)) return base;
  let n = 1;
  while (existingLabels.has(`${base} (${n})`)) n++;
  return `${base} (${n})`;
}