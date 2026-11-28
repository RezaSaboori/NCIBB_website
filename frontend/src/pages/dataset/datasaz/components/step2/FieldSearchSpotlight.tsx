/* FieldSearchSpotlight.tsx */
import React, { useEffect, useRef } from "react";
import "./fieldSearchSpotlight.css";
import { SearchInput } from "@/components/ui/inputs";
import type { SuggestionItem } from "../../types";

interface FieldSearchSpotlightProps {
  isOpen: boolean;
  query: string;
  suggestions: SuggestionItem[];
  isLoading: boolean;
  error: string | null;
  onQueryChange: (value: string) => void;
  onSelect: (item: SuggestionItem) => void;
  onClose: () => void;
}

export const FieldSearchSpotlight = React.forwardRef<HTMLDivElement, FieldSearchSpotlightProps>(
  function FieldSearchSpotlight({ isOpen, query, suggestions, isLoading, error, onQueryChange, onSelect, onClose }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isOpen) {
        const t = setTimeout(() => inputRef.current?.focus(), 80);
        return () => clearTimeout(t);
      }
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    // Close when clicking outside the spotlight panel (anywhere on the page)
    useEffect(() => {
      if (!isOpen) return;
      const onDocMouseDown = (e: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          onClose();
        }
      };
      document.addEventListener("mousedown", onDocMouseDown);
      return () => document.removeEventListener("mousedown", onDocMouseDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className="s2-spotlight-overlay"
      >
        <div ref={panelRef} className="s2-spotlight">
          {/* Search Row */}
          <SearchInput className="s2-spotlight__search-row" value={query} onChange={onQueryChange}
            placeholder="Search fields…" ariaLabel="Search fields"
            inputProps={{ ref: inputRef, type: "search", lang: "en", dir: "ltr" }} />

          {/* Floating suggestion tabs */}
          {(suggestions.length > 0 || isLoading || error) && (
            <div className="s2-spotlight__suggestions">
              {isLoading && (
                <span className="s2-spotlight__loading" lang="en" dir="ltr" role="status">Searching…</span>
              )}
              {!isLoading && error && (
                <span className="s2-spotlight__error" dir="auto" role="alert">{error}</span>
              )}
              {!isLoading &&
                !error &&
                suggestions.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    className="glass-transparent s2-spotlight__suggestion-tab"
                    onClick={() => onSelect(item)}
                  >
                    <span className="s2-spotlight__suggestion-name" dir="auto">{item.name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);
