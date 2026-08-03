/*ProjectInfoCard.tsx*/
import React from "react";
import { TextInput, NumberInput } from "../../../../../components/ui/inputs";

interface ProjectInfoCardProps {
  projectName: string;
  estimatedCount: string;
  onProjectNameChange: (value: string) => void;
  onEstimatedCountChange: (value: string) => void;
  btnState: "idle" | "loading" | "done";
  btnLabel: string;
  onConfirm: () => void;
}

export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({
  projectName,
  estimatedCount,
  onProjectNameChange,
  onEstimatedCountChange,
  btnState,
  btnLabel,
  onConfirm,
}) => {
  return (
    <div className="glass dz-glass-container dz-glass-container--lg">
      <div className="dz-glass-container__header">
        <h2 className="s1-card-header__title">اطلاعات پروژه</h2>
      </div>
      <div className="dz-glass-container__body">
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
          <span className="s1-hint">تعداد تقریبی رکوردهای داده‌ای که قرار است پردازش شوند</span>
        </div>
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