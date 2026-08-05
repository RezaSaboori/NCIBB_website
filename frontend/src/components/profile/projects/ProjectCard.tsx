import React from "react";
import type { UserProject } from "../../../types/profile.types";
import "../../../styles/glass.css";
import "./projects.css";

interface ProjectCardProps {
  project: UserProject;
  onDelete: (project: UserProject) => void;
  onOpen: (project: UserProject) => void;
}

const formatPersianDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("fa-IR");
  } catch {
    return "—";
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  onOpen,
}) => {
  return (
    <div className="glass dz-glass-container dz-glass-container--sm project-card">
      {/* Header */}
      <div className="dz-glass-container__header project-card__header">
        <span className="project-card__title">{project.name}</span>
      </div>

      {/* Body */}
      <div className="dz-glass-container__body project-card__body">
        <div className="project-card__dates">
          <div className="project-card__date-item">
            <span className="project-card__date-label">تاریخ ایجاد پروژه:</span>
            <span className="project-card__date-value">
              {formatPersianDate(project.createdAt)}
            </span>
          </div>
          <div className="project-card__date-item">
            <span className="project-card__date-label">تاریخ آخرین تغییر:</span>
            <span className="project-card__date-value">
              {formatPersianDate(project.updatedAt)}
            </span>
          </div>
        </div>
        <span className="project-card__stage">{project.stageLabel}</span>
        <span className="project-card__status">{project.statusLabel}</span>
      </div>

      {/* Footer */}
      <div className="project-card__footer">
        <button
          className="red-glass s2-criteria-window__btn project-card__action-btn"
          type="button"
          onClick={() => onDelete(project)}
        >
          حذف
        </button>
        <button
          className="blue-glass s2-criteria-window__btn project-card__action-btn"
          type="button"
          onClick={() => onOpen(project)}
        >
          باز کردن
        </button>
      </div>
    </div>
  );
};