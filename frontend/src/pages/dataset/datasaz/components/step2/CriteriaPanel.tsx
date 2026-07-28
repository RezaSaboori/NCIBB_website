/*CriteriaPanel.tsx*/
import React, { useState, useCallback } from "react";
import "./step2.css";
import { CriteriaButton } from "./CriteriaButton";
import { AddCriteriaTab } from "./AddCriteriaTab";
import { CriteriaWindow } from "./CriteriaWindow";
import { FieldSearchSpotlight } from "./FieldSearchSpotlight";
import { SearchIcon, QuestionIcon } from "./icons/Step2Icons";
import { useFieldSearch } from "../../hooks/useFieldSearch";
import type { SuggestionItem } from "../../types";

interface CriteriaItem {
  id: number;
  label: string;
}

interface CriteriaPanelProps {
  type: "inclusion" | "exclusion";
}

export const CriteriaPanel: React.FC<CriteriaPanelProps> = ({ type }) => {
  const isInclusion = type === "inclusion";

  const titleClass = isInclusion
    ? "s2-panel-header__title--inclusion"
    : "s2-panel-header__title--exclusion";

  const title = isInclusion ? "Inclusion Criteria" : "Exclusion Criteria";
  const btnLabel = isInclusion ? "Add inclusion" : "Add exclusion";

  const SAMPLE_INCLUSION: CriteriaItem[] = [
    { id: 1,  label: "WBC Count" },
    { id: 2,  label: "Hemoglobin" },
    { id: 3,  label: "Platelet Count" },
    { id: 4,  label: "Fasting Glucose" },
    { id: 5,  label: "HbA1c" },
    { id: 6,  label: "Serum Creatinine" },
    { id: 7,  label: "eGFR" },
    { id: 8,  label: "TSH" },
    { id: 9,  label: "LDL Cholesterol" },
    { id: 10, label: "CRP" },
  ];

  const SAMPLE_EXCLUSION: CriteriaItem[] = [
    { id: 1,  label: "HIV Antibody" },
    { id: 2,  label: "HBsAg" },
    { id: 3,  label: "Anti-HCV" },
    { id: 4,  label: "Serum Bilirubin" },
    { id: 5,  label: "ALT" },
    { id: 6,  label: "AST" },
    { id: 7,  label: "Urine Protein" },
    { id: 8,  label: "PT / INR" },
    { id: 9,  label: "D-Dimer" },
    { id: 10, label: "Beta-hCG" },
  ];

  const [criteria, setCriteria] = useState<CriteriaItem[]>(
    isInclusion ? SAMPLE_INCLUSION : SAMPLE_EXCLUSION
  );
  const [nextId, setNextId] = useState(11);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  const { query, suggestions, isLoading, error, handleQueryChange, reset } = useFieldSearch();

  const handleOpenSpotlight = useCallback(() => {
    setSpotlightOpen(true);
  }, []);

  const handleCloseSpotlight = useCallback(() => {
    setSpotlightOpen(false);
    reset();
  }, [reset]);

  const handleSelectSuggestion = useCallback(
    (item: SuggestionItem) => {
      setCriteria((prev) => [...prev, { id: nextId, label: item.name }]);
      setNextId((n) => n + 1);
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
          <div className="s2-panel-header__search-box">
            <input
              className="s2-search-input"
              type="text"
              placeholder="Search Imported Criteria"
              disabled
            />
            <button className="glass dz-icon-btn s2-icon-btn s2-icon-btn--search" aria-label="Search">
              <SearchIcon className="dz-icon-btn__icon dz-icon-btn__icon--search" />
            </button>
          </div>
        </div>

        <button className="glass dz-icon-btn s2-icon-btn s2-icon-btn--help" aria-label="Help">
          <QuestionIcon className="dz-icon-btn__icon dz-icon-btn__icon--question" />
        </button>
      </div>

      {/* Tabs */}
      <div className="dz-criteria-tabs">
        {criteria.map((c) => (
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
        <AddCriteriaTab label={btnLabel} isActive={spotlightOpen} onClick={handleOpenSpotlight} />
      </div>

      {/* Spotlight — sits in normal flow directly after tabs, grows naturally */}
      <FieldSearchSpotlight
        isOpen={spotlightOpen}
        query={query}
        suggestions={suggestions}
        isLoading={isLoading}
        error={error}
        onQueryChange={handleQueryChange}
        onSelect={handleSelectSuggestion}
        onClose={handleCloseSpotlight}
      />

      {/* Expanded criteria windows — independent of spotlight state */}
      {expandedIds.size > 0 && (
        <div className="dz-glass-container__body s2-criteria-windows">
          {criteria
            .filter((c) => expandedIds.has(c.id))
            .map((c) => (
              <CriteriaWindow
                key={c.id}
                label={c.label}
                onMinimize={() => handleToggleExpand(c.id)}
                onDelete={() => handleDelete(c.id)}
              />
            ))}
        </div>
      )}
    </div>
  );
};