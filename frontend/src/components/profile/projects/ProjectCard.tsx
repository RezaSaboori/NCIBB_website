import React from "react";
import type { UserProject } from "../../../types/profile.types";
import { TrashIcon, QuestionIcon } from "../../../pages/dataset/datasaz/components/step2/icons/Step2Icons";
import "../../../styles/glass.css";
import "./projects.css";

interface ProjectCardProps {
  project: UserProject;
  onDelete: (project: UserProject) => void;
  onOpen: (project: UserProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  onOpen,
}) => {
  return (
    <div className="glass dz-glass-container dz-glass-container--sm project-card">
      {/* Header */}
      <div className="dz-glass-container__header project-card__header">
        <span className="project-card__title text-headline">{project.name}</span>
        <div className="project-card__header-actions">
          <button
            className="teal-glass dz-icon-btn"
            aria-label="راهنما"
            type="button"
            title={`سرویس: ${project.serviceLabel}`}
          >
            <QuestionIcon className="dz-icon-btn__icon dz-icon-btn__icon--question" />
          </button>
          <button
            className="red-glass dz-icon-btn"
            aria-label="حذف"
            type="button"
            onClick={() => onDelete(project)}
          >
            <TrashIcon className="dz-icon-btn__icon dz-icon-btn__icon--trash" />
          </button>
        </div>
      </div>

      {/* Body — Stage */}
      <div className="dz-glass-container__body project-card__body">
        <span className="project-card__stage text-subhead">{project.stageLabel}</span>
        <span className="project-card__status text-caption1">{project.statusLabel}</span>
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