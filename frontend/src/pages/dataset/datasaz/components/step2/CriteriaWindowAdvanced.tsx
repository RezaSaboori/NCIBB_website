/* CriteriaWindowAdvanced.tsx
 * Advanced group wrapper for a CriteriaWindow.
 * Structure:
 *   - Header: editable group name input + Required toggle btn + action icons
 *   - Tabs row: one tab per entry (first = original field) + "Add criteria" tab (spotlight)
 *   - Pane area: shows CriteriaWindowMini for the active tab
 *                + FieldSearchSpotlight when adding
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import "./criteriaAdvanced.css";
import { QuestionIcon, TrashIcon, MinimizeIcon } from "./icons/Step2Icons";
import { CriteriaButton } from "./CriteriaButton";
import { AddCriteriaTab } from "./AddCriteriaTab";
import { CriteriaWindowMini } from "./CriteriaWindowMini";
import { FieldSearchSpotlight } from "./FieldSearchSpotlight";
import { useFieldSearch } from "../../hooks/useFieldSearch";
import type { CriteriaItem, AdvancedCriteriaEntry } from "../../types";

interface CriteriaWindowAdvancedProps {
  /** The originating CriteriaItem — always the first entry */
  origin: CriteriaItem;
  defaultGroupName?: string;
  onExitAdvanced: () => void;
  onMinimize: () => void;
  onDelete: () => void;
  onHelp?: () => void;
}

let _advEntryIdCounter = 0;
const nextEntryId = () => ++_advEntryIdCounter;

export const CriteriaWindowAdvanced: React.FC<CriteriaWindowAdvancedProps> = ({
  origin,
  defaultGroupName = "Group 1",
  onExitAdvanced,
  onMinimize,
  onDelete,
  onHelp,
}) => {
  const [groupName, setGroupName] = useState(defaultGroupName);
  const [isRequired, setIsRequired] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightMinHeight, setSpotlightMinHeight] = useState(0);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const spotlightRoRef = useRef<ResizeObserver | null>(null);

  const { query, suggestions, isLoading, error, handleQueryChange, reset } = useFieldSearch();

  // Build entries: first entry is always the origin field
  const [entries, setEntries] = useState<AdvancedCriteriaEntry[]>([
    { ...origin, entryId: nextEntryId() },
  ]);
  const [activeEntryId, setActiveEntryId] = useState<number>(entries[0].entryId);
  const [expandedEntryIds, setExpandedEntryIds] = useState<Set<number>>(
    new Set([entries[0].entryId])
  );

  // Mirror spotlight min-height from CriteriaPanel logic
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
      const ro = new ResizeObserver(() => setSpotlightMinHeight(el.offsetHeight));
      ro.observe(el);
      spotlightRoRef.current = ro;
    });
    return () => {
      cancelAnimationFrame(frameId);
      spotlightRoRef.current?.disconnect();
      spotlightRoRef.current = null;
    };
  }, [spotlightOpen]);

  const handleOpenSpotlight = useCallback(() => setSpotlightOpen(true), []);

  const handleCloseSpotlight = useCallback(() => {
    setSpotlightOpen(false);
    reset();
  }, [reset]);

  const handleSelectSuggestion = useCallback(
    (item: any) => {
      const newEntryId = nextEntryId();
      setEntries((prev) => {
        const base = item.name;
        const existingLabels = new Set(prev.map((e) => e.label));
        let label = base;
        let counter = 1;
        while (existingLabels.has(label)) {
          label = `${base} (${counter})`;
          counter++;
        }
        return [
          ...prev,
          {
            entryId: newEntryId,
            id: newEntryId,
            label,
            unit: item.unit,
            value_type: item.value_type,
            value_min: item.min,
            value_max: item.max,
            values: item.values,
          },
        ];
      });
      setActiveEntryId(newEntryId);
      setExpandedEntryIds((prev) => { const s = new Set(prev); s.add(newEntryId); return s; });
      handleCloseSpotlight();
    },
    [handleCloseSpotlight]
  );

  const handleDeleteEntry = useCallback(
    (entryId: number) => {
      // Cannot delete the last entry
      setEntries((prev) => {
        if (prev.length === 1) return prev;
        return prev.filter((e) => e.entryId !== entryId);
      });
      setExpandedEntryIds((prev) => { const s = new Set(prev); s.delete(entryId); return s; });
      setActiveEntryId((prev) => {
        if (prev !== entryId) return prev;
        return entries.find((e) => e.entryId !== entryId)?.entryId ?? entries[0].entryId;
      });
    },
    [entries]
  );

  const handleToggleExpand = useCallback((entryId: number) => {
    setExpandedEntryIds((prev) => {
      const s = new Set(prev);
      s.has(entryId) ? s.delete(entryId) : s.add(entryId);
      return s;
    });
  }, []);

  const activeEntry = entries.find((e) => e.entryId === activeEntryId) ?? entries[0];

  return (
    <div className="opal-glass dz-glass-container dz-glass-container--sm s2-criteria-window s2-criteria-window--advanced s2-adv-group">
      {/* Header */}
      <div className="dz-glass-container__header s2-criteria-window__header s2-adv-group__header">
        <input
          className="s2-adv-group__name-input"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          aria-label="Group name"
          type="text"
        />
        <button
          className={`s2-adv-group__required-btn${isRequired ? " s2-adv-group__required-btn--active" : ""}`}
          type="button"
          onClick={() => setIsRequired((v) => !v)}
        >
          Required
        </button>
        <div className="s2-criteria-window__header-actions">
          <button
            className="teal-glass dz-icon-btn s2-icon-btn"
            aria-label="Help"
            onClick={onHelp}
            type="button"
          >
            <QuestionIcon className="dz-icon-btn__icon dz-icon-btn__icon--question" />
          </button>
          <button
            className="orange-glass dz-icon-btn s2-icon-btn"
            aria-label="Minimize"
            onClick={onMinimize}
            type="button"
          >
            <MinimizeIcon className="dz-icon-btn__icon dz-icon-btn__icon--minimize" />
          </button>
          <button
            className="red-glass dz-icon-btn s2-icon-btn"
            aria-label="Delete group"
            onClick={onDelete}
            type="button"
          >
            <TrashIcon className="dz-icon-btn__icon dz-icon-btn__icon--trash" />
          </button>
        </div>
      </div>

      {/* Tabs row */}
      <div className="s2-criteria-tabs-anchor">
        <div className="dz-criteria-tabs s2-adv-group__tabs">
          {entries.map((entry) => (
            <CriteriaButton
              key={entry.entryId}
              label={entry.label}
              isSelected={activeEntryId === entry.entryId}
              isExpanded={expandedEntryIds.has(entry.entryId)}
              isAdvanced={false}
              onSelect={() => setActiveEntryId(entry.entryId)}
              onExpand={() => handleToggleExpand(entry.entryId)}
              onDelete={() => handleDeleteEntry(entry.entryId)}
            />
          ))}
          <AddCriteriaTab
            label="Add criteria"
            isActive={spotlightOpen}
            onClick={handleOpenSpotlight}
          />
        </div>
      </div>

      {/* Pane: spotlight + active mini window */}
      <div
        className="s2-criteria-body s2-adv-group__pane"
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
        {expandedEntryIds.has(activeEntryId) && (
          <CriteriaWindowMini
            label={activeEntry.label}
            unit={activeEntry.unit}
            value_type={activeEntry.value_type}
            value_min={activeEntry.value_min}
            value_max={activeEntry.value_max}
            values={activeEntry.values}
            onClose={() => handleToggleExpand(activeEntryId)}
            onDelete={() => handleDeleteEntry(activeEntryId)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="s2-criteria-window__footer">
        <div className="s2-criteria-window__footer-left">
          <button className="blue-glass s2-criteria-window__btn" type="button" onClick={onMinimize}>
            Submit
          </button>
          <button className="red-glass s2-criteria-window__btn" type="button" onClick={onDelete}>
            Delete
          </button>
        </div>
        <button
          className="glass s2-criteria-window__btn s2-criteria-window__btn--advanced s2-criteria-window__btn--advanced-active"
          type="button"
          onClick={onExitAdvanced}
        >
          Enter Simple Mode
        </button>
      </div>
    </div>
  );
};