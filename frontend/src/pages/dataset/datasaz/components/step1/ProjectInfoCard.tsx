/*ProjectInfoCard.tsx*/
import React from "react";
import { TextInput, NumberInput } from "../../../../../components/ui/inputs";

interface ProjectInfoCardProps {
  projectName: string;
  estimatedCount: string;
  onProjectNameChange: (value: string) => void;
  onEstimatedCountChange: (value: string) => void;
}

export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({
  projectName,
  estimatedCount,
  onProjectNameChange,
  onEstimatedCountChange,
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
    </div>
  );
};