/*ProjectInfoCard.tsx*/
import React from "react";

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
    <div className="glass s1-glass-card">
      <div className="s1-card-header">
        <span className="s1-card-header__icon">🗂️</span>
        <h2 className="s1-card-header__title">اطلاعات پروژه</h2>
      </div>
      <div className="s1-card-body">
        <div className="s1-field">
          <label className="s1-label" htmlFor="project-name">
            نام پروژه
          </label>
          <input
            id="project-name"
            type="text"
            className="s1-input"
            placeholder="نام پروژه را وارد کنید"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            dir="rtl"
          />
        </div>
        <div className="s1-field">
          <label className="s1-label" htmlFor="estimated-count">
            تعداد داده تخمینی
          </label>
          <input
            id="estimated-count"
            type="number"
            className="s1-input"
            placeholder="مثال: ۱۰۰۰"
            value={estimatedCount}
            onChange={(e) => onEstimatedCountChange(e.target.value)}
            dir="rtl"
            min={1}
          />
          <span className="s1-hint">تعداد تقریبی رکوردهای داده‌ای که قرار است پردازش شوند</span>
        </div>
      </div>
    </div>
  );
};