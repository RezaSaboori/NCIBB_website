/*CriteriaPanel.tsx*/
import React, { useState, useCallback, useRef, useEffect } from "react";
import "./step2.css";
import { CriteriaButton } from "./CriteriaButton";
import { AddCriteriaTab } from "./AddCriteriaTab";
import { CriteriaWindow } from "./CriteriaWindow";
import { CriteriaWindowAdvanced } from "./CriteriaWindowAdvanced";
import { FieldSearchSpotlight } from "./FieldSearchSpotlight";
import { SearchIcon, QuestionIcon } from "./icons/Step2Icons";
import { SearchInput } from "../../../../../components/ui/inputs";
import { useFieldSearch } from "../../hooks/useFieldSearch";
import { useCriteriaSearch } from "../../hooks/useCriteriaSearch";
import { useTabFocusScroll } from "../../hooks/useTabFocusScroll";
import type { SuggestionItem, CriteriaItem } from "../../types";
import type { RowState } from "./CriteriaWindowRow";
import { resolveCriteriaLabel } from "../../../utils/criteriaLabel";

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
  // Per-criteria rows snapshot: preserved across simple↔advanced mode switches
  const simpleRowsRef = useRef<Map<number, RowState[]>>(new Map());
  // (advGroupCounterRef removed — group number derived from live advancedIds size)
  // Per-criteria group name (controlled from panel, reflected in tab label)
  const [groupNames, setGroupNames] = useState<Map<number, string>>(new Map());
  // Per-criteria group required (controlled from panel)
  const [groupRequired, setGroupRequired] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    onCountChange?.(criteria.length);
  }, [criteria.length, onCountChange]);
  const { searchQuery, handleSearchChange, filteredCriteria, isFiltering } =
    useCriteriaSearch(criteria);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [advancedIds, setAdvancedIds] = useState<Set<number>>(new Set());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const spotlightOpenRef = useRef(false);
  useEffect(() => { spotlightOpenRef.current = spotlightOpen; }, [spotlightOpen]);
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

  const windowsContainerRef = useRef<HTMLDivElement | null>(null);
  const tabsAnchorRef = useRef<HTMLDivElement | null>(null);

  const { scrollToWindow, suppressNextCollapseRef } = useTabFocusScroll({
    selectedId,
    setSelectedId,
    expandedIds,
    windowsContainerRef,
    tabsAnchorRef,
    spotlightOpenRef,
  });

  // Scroll to a newly added criteria tab after the DOM has painted the new window
  const pendingScrollIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (pendingScrollIdRef.current === null) return;
    const id = pendingScrollIdRef.current;
    pendingScrollIdRef.current = null;
    // rAF ensures the DOM node for the new window exists before querying
    const frame = requestAnimationFrame(() => {
      const container = windowsContainerRef.current;
      if (!container) return;
      const target = container.querySelector<HTMLElement>(`[data-criteria-id="${id}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [criteria, windowsContainerRef]);

  const handleSelectSuggestion = useCallback(
    (item: SuggestionItem) => {
      const newId = nextId;
      setCriteria((prev) => {
        const base = item.name;
        const existingLabels = new Set(prev.map((c) => c.label));
        const label = resolveCriteriaLabel(base, existingLabels);
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
      pendingScrollIdRef.current = newId;
      suppressNextCollapseRef.current = true;
      handleCloseSpotlight();
    },
    [nextId, handleCloseSpotlight]
  );

  const handleDelete = useCallback((id: number) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
    setExpandedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const handleSelect = useCallback(
    (id: number) => {
      setSelectedId((prev) => (prev === id ? null : id));
      scrollToWindow(id);
    },
    [scrollToWindow]
  );

  const handleToggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleToggleAdvanced = useCallback((id: number) => {
    setAdvancedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Exiting advanced → simple: re-derive label to avoid collisions with siblings
        next.delete(id);
        setCriteria((prevCriteria) => {
          const target = prevCriteria.find((c) => c.id === id);
          if (!target) return prevCriteria;
          // Strip any existing numbering to get the true base name
          const base = target.label.replace(/ \(\d+\)$/, "");
          const otherLabels = new Set(
            prevCriteria.filter((c) => c.id !== id).map((c) => c.label)
          );
          const label = resolveCriteriaLabel(base, otherLabels);
          return prevCriteria.map((c) => (c.id === id ? { ...c, label } : c));
        });
      } else {
        // Entering advanced: seed group name based on current live advanced count
        next.add(id);
        setGroupNames((gn) => {
          if (gn.has(id)) return gn;
          const m = new Map(gn);
          m.set(id, `Group ${next.size}`);
          return m;
        });
      }
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
      <div className="s2-criteria-tabs-anchor" ref={tabsAnchorRef}>
        <div className="dz-criteria-tabs">
          {filteredCriteria.map((c) => (
            <CriteriaButton
              key={c.id}
              label={advancedIds.has(c.id) ? (groupNames.get(c.id) ?? c.label) : c.label}
              isSelected={selectedId === c.id}
              isExpanded={expandedIds.has(c.id)}
              isAdvanced={advancedIds.has(c.id)}
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
            <div className="s2-criteria-windows" ref={windowsContainerRef}>
              {(isFiltering ? filteredCriteria : criteria)
                .filter((c) => expandedIds.has(c.id))
                .slice()
                .reverse()
                .map((c) =>
                  advancedIds.has(c.id) ? (
                    <div key={c.id} data-criteria-id={c.id}>
                      <CriteriaWindowAdvanced
                        origin={c}
                        groupName={groupNames.get(c.id) ?? `Group ${c.id}`}
                        onGroupNameChange={(name) =>
                          setGroupNames((prev) => { const m = new Map(prev); m.set(c.id, name); return m; })
                        }
                        isGroupRequired={groupRequired.get(c.id) ?? false}
                        onGroupRequiredChange={(val) =>
                          setGroupRequired((prev) => { const m = new Map(prev); m.set(c.id, val); return m; })
                        }
                        initialRows={simpleRowsRef.current.get(c.id)}
                        onExitAdvanced={() => handleToggleAdvanced(c.id)}
                        onMinimize={() => handleToggleExpand(c.id)}
                        onDelete={() => handleDelete(c.id)}
                      />
                    </div>
                  ) : (
                    <div key={c.id} data-criteria-id={c.id}>
                      <CriteriaWindow
                        label={c.label}
                        unit={c.unit}
                        value_type={c.value_type}
                        value_min={c.value_min}
                        value_max={c.value_max}
                        values={c.values}
                        isAdvanced={false}
                        onToggleAdvanced={() => handleToggleAdvanced(c.id)}
                        onMinimize={() => handleToggleExpand(c.id)}
                        onDelete={() => handleDelete(c.id)}
                        initialRows={simpleRowsRef.current.get(c.id)}
                        onRowsChange={(rows) => { simpleRowsRef.current.set(c.id, rows); }}
                      />
                    </div>
                  )
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};