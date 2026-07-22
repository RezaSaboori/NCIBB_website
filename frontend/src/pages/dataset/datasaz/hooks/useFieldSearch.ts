/* useFieldSearch.ts */
import { useState, useRef, useCallback } from "react";
import { fetchSuggestions } from "../api/autocompleteApi";
import type { SuggestionItem } from "../types";

const DEBOUNCE_MS = 200;
const MIN_QUERY_LEN = 2;

export function useFieldSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSuggestions([]);
    setError(null);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (value.length < MIN_QUERY_LEN) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await fetchSuggestions(value);
        setSuggestions(data.results);
      } catch {
        setError("Could not fetch suggestions");
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setQuery("");
    setSuggestions([]);
    setIsLoading(false);
    setError(null);
  }, []);

  return { query, suggestions, isLoading, error, handleQueryChange, reset };
}