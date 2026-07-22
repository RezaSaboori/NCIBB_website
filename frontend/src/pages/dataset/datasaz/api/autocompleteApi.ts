/* autocompleteApi.ts */
import type { AutocompleteResponse } from "../types";

const AUTOCOMPLETE_BASE = "http://localhost:5175";

export async function fetchSuggestions(
  query: string,
  limit = 15,
  mode: "cache" | "live" | "prefix" = "cache"
): Promise<AutocompleteResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    mode,
  });
  const res = await fetch(`${AUTOCOMPLETE_BASE}/autocomplete?${params}`);
  if (!res.ok) throw new Error(`Autocomplete error: ${res.status}`);
  return res.json();
}