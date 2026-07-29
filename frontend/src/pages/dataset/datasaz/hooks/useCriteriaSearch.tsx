/* useCriteriaSearch.ts */
import { useState, useCallback, useMemo } from "react";
import type { CriteriaItem } from "../types";

export function useCriteriaSearch(criteria: CriteriaItem[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
    },
    []
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCriteria = useMemo(() => {
    if (!normalizedQuery) return criteria;
    return criteria.filter((c) =>
      c.label.toLowerCase().includes(normalizedQuery)
    );
  }, [criteria, normalizedQuery]);

  const isFiltering = normalizedQuery.length > 0;

  return { searchQuery, handleSearchChange, filteredCriteria, isFiltering };
}