/* FieldSearchSpotlight.tsx */
import React, { useEffect, useRef } from "react";
import "./fieldSearchSpotlight.css";
import { SearchIcon } from "./icons/Step2Icons";
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

export const FieldSearchSpotlight: React.FC<FieldSearchSpotlightProps> = ({
  isOpen,
  query,
  suggestions,
  isLoading,
  error,
  onQueryChange,
  onSelect,
  onClose,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Delay to allow CSS enter animation to start first
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="s2-spotlight-overlay"
      onMouseDown={(e) => {
        // Close when clicking the backdrop, not the panel itself
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="s2-spotlight">
        {/* Search Row */}
        <div className="glass-transparent s2-spotlight__search-row">
          <input
            ref={inputRef}
            className="s2-spotlight__input"
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search fields…"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="glass-transparent s2-spotlight__search-icon-wrap">
            <SearchIcon className="s2-spotlight__search-icon" />
          </span>
        </div>

        {/* Floating suggestion tabs */}
        {(suggestions.length > 0 || isLoading || error) && (
          <div className="s2-spotlight__suggestions">
            {isLoading && (
              <span className="s2-spotlight__loading">Searching…</span>
            )}
            {!isLoading && error && (
              <span className="s2-spotlight__error">{error}</span>
            )}
            {!isLoading && !error &&
              suggestions.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className="glass-transparent s2-spotlight__suggestion-tab"
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent input blur before click fires
                    onSelect(item);
                  }}
                >
                  <span className="s2-spotlight__suggestion-name">{item.name}</span>
                  <span className="s2-spotlight__suggestion-path">
                    {item.path.slice(0, -1).join(" › ")}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};