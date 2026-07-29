/*CriteriaPanel.tsx*/
import React, { useState, useCallback, useRef, useEffect } from "react";
import "./step2.css";
import { CriteriaButton } from "./CriteriaButton";
import { AddCriteriaTab } from "./AddCriteriaTab";
import { CriteriaWindow } from "./CriteriaWindow";
import { FieldSearchSpotlight } from "./FieldSearchSpotlight";
import { SearchIcon, QuestionIcon } from "./icons/Step2Icons";
import { SearchInput } from "../../../../../components/ui/inputs";
import { useFieldSearch } from "../../hooks/useFieldSearch";
import { useCriteriaSearch } from "../../hooks/useCriteriaSearch";
import type { SuggestionItem, CriteriaItem } from "../../types";

interface CriteriaPanelProps {
  type: "inclusion" | "exclusion";
  onCountChange?: (count: number) => void;
}

export const CriteriaPanel: React.FC<CriteriaPanelProps> = ({ type, onCountChange }) => {
  const isInclusion = type === "inclusion";

  const titleClass = isInclusion
    ? "s2-panel-header__title--inclusion"
    : "s2-panel-header__title--exclusion";

  const title = isInclusion ? "Inclusion Criteria" : "Exclusion Criteria";
  const btnLabel = isInclusion ? "Add inclusion" : "Add exclusion";

  const [criteria, setCriteria] = useState<CriteriaItem[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    onCountChange?.(criteria.length);
  }, [criteria.length, onCountChange]);
  const { searchQuery, handleSearchChange, filteredCriteria, isFiltering } =
    useCriteriaSearch(criteria);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightMinHeight, setSpotlightMinHeight] = useState(0);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const spotlightRoRef = useRef<ResizeObserver | null>(null);

  const { query, suggestions, isLoading, error, handleQueryChange, reset } = useFieldSearch();

  // Drive s2-criteria-body minHeight from spotlight's live rendered height
  useEffect(() => {
    if (!spotlightOpen) {
      setSpotlightMinHeight(0);
      spotlightRoRef.current?.disconnect();
      spotlightRoRef.current = null;
      return;
    }

    let frameId: number;
    frameId = requestAnimationFrame(() => {
      const el = spotlightRef.current;
      if (!el) return;
      setSpotlightMinHeight(el.offsetHeight);
      const ro = new ResizeObserver(() => {
        setSpotlightMinHeight(el.offsetHeight);
      });
      ro.observe(el);
      spotlightRoRef.current = ro;
    });

    return () => {
      cancelAnimationFrame(frameId);          // ← cancel the rAF
      spotlightRoRef.current?.disconnect();
      spotlightRoRef.current = null;
    };
  }, [spotlightOpen]);

  const handleOpenSpotlight = useCallback(() => {
    setSpotlightOpen(true);
  }, []);

  const handleCloseSpotlight = useCallback(() => {
    setSpotlightOpen(false);
    reset();
  }, [reset]);

  const handleSelectSuggestion = useCallback(
    (item: SuggestionItem) => {
      const newId = nextId;
      setCriteria((prev) => {
        const base = item.name;
        const existingLabels = new Set(prev.map((c) => c.label));
        let label = base;
        let counter = 1;
        while (existingLabels.has(label)) {
          label = `${base} (${counter})`;
          counter++;
        }
        return [
          ...prev,
          {
            id: newId,
            label,
            unit: item.unit,
            value_type: item.value_type,
            value_min: item.min,
            value_max: item.max,
            values: item.values,
          },
      ];
      });
      setNextId((n) => n + 1);
      setExpandedIds((prev) => { const next = new Set(prev); next.add(newId); return next; });
      setSelectedId(newId);
      handleCloseSpotlight();
    },
    [nextId, handleCloseSpotlight]
  );

  const handleDelete = useCallback((id: number) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
    setExpandedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const handleSelect = useCallback((id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleToggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return (
    <div className={`glass dz-glass-container dz-glass-container--md s2-criteria-panel${spotlightOpen ? " s2-criteria-panel--spotlight-open" : ""}`}>
      {/* Header */}
      <div className="dz-glass-container__header">
        <span className={`s2-panel-header__title ${titleClass}`}>{title}</span>

        <div className="s2-panel-header__search">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search criteria…"
            multiline
            icon={
              <button className="glass dz-icon-btn s2-icon-btn s2-icon-btn--search" aria-label="Search">
                <SearchIcon className="dz-icon-btn__icon dz-icon-btn__icon--search" />
              </button>
            }
          />
        </div>

        <button className="glass dz-icon-btn s2-icon-btn s2-icon-btn--help" aria-label="Help">
          <QuestionIcon className="dz-icon-btn__icon dz-icon-btn__icon--question" />
        </button>
      </div>

      {/* Tabs row */}
      <div className="s2-criteria-tabs-anchor">
        <div className="dz-criteria-tabs">
          {filteredCriteria.map((c) => (
            <CriteriaButton
              key={c.id}
              label={c.label}
              isSelected={selectedId === c.id}
              isExpanded={expandedIds.has(c.id)}
              onSelect={() => handleSelect(c.id)}
              onExpand={() => handleToggleExpand(c.id)}
              onDelete={() => handleDelete(c.id)}
            />
          ))}
          {isFiltering && filteredCriteria.length === 0 && (
            <span className="s2-search-empty">No criteria match</span>
          )}
          <AddCriteriaTab label={btnLabel} isActive={spotlightOpen} onClick={handleOpenSpotlight} />
        </div>
      </div>

      {/* Body: spotlight floats in front; windows in flow below; body grows to fit whichever is taller */}
      {(spotlightOpen || expandedIds.size > 0) && (
        <div
          className="s2-criteria-body"
          style={{ minHeight: spotlightMinHeight > 0 ? spotlightMinHeight : undefined }}
        >
          <FieldSearchSpotlight
            ref={spotlightRef}
            isOpen={spotlightOpen}
            query={query}
            suggestions={suggestions}
            isLoading={isLoading}
            error={error}
            onQueryChange={handleQueryChange}
            onSelect={handleSelectSuggestion}
            onClose={handleCloseSpotlight}
          />
          {expandedIds.size > 0 && (
            <div className="s2-criteria-windows">
              {(isFiltering ? filteredCriteria : criteria)
                .filter((c) => expandedIds.has(c.id))
                .slice()
                .reverse()
                .map((c) => (
                  <CriteriaWindow
                    key={c.id}
                    label={c.label}
                    unit={c.unit}
                    value_type={c.value_type}
                    value_min={c.value_min}
                    value_max={c.value_max}
                    values={c.values}
                    onMinimize={() => handleToggleExpand(c.id)}
                    onDelete={() => handleDelete(c.id)}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};