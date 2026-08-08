/*ProjectInfoCard.tsx*/
import React, { useRef } from "react";
import { TextInput, NumberInput, DropdownInput } from "../../../../../components/ui/inputs";
import { ChevronIcon } from "../step2/icons/Step2Icons";
import { useDataFinderModeIndicator } from "../../../hooks/useDataFinderModeIndicator";

type ProjectMode = "new" | "existing";
type BtnState = "idle" | "loading" | "done";

interface ProjectInfoCardProps {
  showModeToggle: boolean;
  mode: ProjectMode;
  onModeChange: (mode: ProjectMode) => void;
  projectName: string;
  estimatedCount: string;
  onProjectNameChange: (value: string) => void;
  onEstimatedCountChange: (value: string) => void;
  btnState: BtnState;
  btnLabel: string;
  onConfirm: () => void;
  projectOptions: string[];
  selectedProjectName: string;
  onSelectExistingProject: (name: string) => void;
}

export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({
  showModeToggle,
  mode,
  onModeChange,
  projectName,
  estimatedCount,
  onProjectNameChange,
  onEstimatedCountChange,
  btnState,
  btnLabel,
  onConfirm,
  projectOptions,
  selectedProjectName,
  onSelectExistingProject,
}) => {
  // Show detail fields: always in "new" mode; in "existing" only after a project is selected
  const showDetailFields = mode === "new" || (mode === "existing" && !!selectedProjectName);

  // Blue-glass active indicator — mirrors the datafinder mode toggle.
  // The hook measures the active button and drives the ::after indicator
  // via --active-indicator-* CSS custom properties on the container.
  const modeToggleRef = useRef<HTMLDivElement>(null);
  const activeModeId =
    mode === "new" ? "project-info-mode-new" : "project-info-mode-existing";
  useDataFinderModeIndicator(modeToggleRef, activeModeId, [showModeToggle]);

  return (
    <div className="glass dz-glass-container dz-glass-container--lg">
      <div className={`dz-glass-container__header s1-card-header${showModeToggle ? "" : " s1-card-header--no-toggle"}`}>
        {showModeToggle && (
          <div
            ref={modeToggleRef}
            className="data-finder-modes-container glass s1-mode-toggle"
            dir="rtl"
          >
            <button
              type="button"
              id="project-info-mode-new"
              className={`data-finder-mode${mode === "new" ? " active" : ""}`}
              onClick={() => onModeChange("new")}
            >
              پروژه جدید
            </button>
            <button
              type="button"
              id="project-info-mode-existing"
              className={`data-finder-mode${mode === "existing" ? " active" : ""}`}
              onClick={() => onModeChange("existing")}
            >
              پروژه قبلی
            </button>
          </div>
        )}
        <h2 className="s1-card-header__title">اطلاعات پروژه</h2>
        {/* Mode toggle — styled like the datafinder mode toggle */}

      </div>

      <div className="dz-glass-container__body">
        {/* Existing project: show dropdown first */}
        {mode === "existing" && (
          <div className="s1-field">
            <label className="s1-label">انتخاب پروژه</label>
            <DropdownInput
              value={selectedProjectName}
              options={projectOptions}
              onChange={onSelectExistingProject}
              placeholder="پروژه را انتخاب کنید"
              chevronIcon={<ChevronIcon />}
              searchable={projectOptions.length > 6}
              dir="rtl"
            />
          </div>
        )}

        {/* Detail fields — shown in "new" mode always; in "existing" after selection */}
        {showDetailFields && (
          <>
            <div className="s1-field">
              <label className="s1-label" htmlFor="project-name">
                نام پروژه
              </label>
              <TextInput
                id="project-name"
                value={projectName}
                onChange={onProjectNameChange}
                placeholder="نام پروژه را وارد کنید"
                dir="rtl"
                className="ui-input-shell--persian"
                multiline
              />
            </div>
            <div className="s1-field">
              <label className="s1-label" htmlFor="estimated-count">
                تعداد داده تخمینی
              </label>
              <NumberInput
                id="estimated-count"
                value={estimatedCount}
                onChange={onEstimatedCountChange}
                placeholder="مثال: ۱۰۰۰"
                dir="rtl"
                min={1}
                className="ui-input-shell--persian"
              />
              <span className="s1-hint">
                تعداد تقریبی رکوردهای داده‌ای که قرار است پردازش شوند
              </span>
            </div>
          </>
        )}
      </div>

      <div className="dz-glass-container__footer">
        <button
          className={`s1-create-btn blue-glass s1-create-btn--${btnState}`}
          type="button"
          onClick={onConfirm}
          disabled={!projectName.trim() || btnState !== "idle"}
          aria-busy={btnState === "loading"}
          aria-label={btnLabel}
        >
          <span className="s1-create-btn__icon">
            {btnState === "loading" && (
              <span className="s1-create-btn__spinner" aria-hidden="true" />
            )}
            {btnState === "done" && (
              <svg className="s1-create-btn__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {btnState === "idle" && (
              <svg className="s1-create-btn__plus" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </span>
          <span className="s1-create-btn__label">{btnLabel}</span>
        </button>
      </div>
    </div>
  );
};