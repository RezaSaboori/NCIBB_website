import React from "react";
import type { UserProject } from "../../../types/profile.types";
import "../../../styles/glass.css";
import "./projects.css";

interface ProjectCardProps {
  project: UserProject;
  onDelete: (project: UserProject) => void;
  onOpen: (project: UserProject) => void;
}

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const QuestionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  onOpen,
}) => {
  return (
    <div className="glass project-card">
      {/* Header */}
      <div className="project-card__header">
        <span className="project-card__title text-headline">{project.name}</span>
        <div className="project-card__header-actions">
          <button
            className="teal-glass project-card__icon-btn"
            aria-label="راهنما"
            type="button"
            title={`سرویس: ${project.serviceLabel}`}
          >
            <QuestionIcon className="project-card__icon" />
          </button>
          <button
            className="red-glass project-card__icon-btn"
            aria-label="حذف"
            type="button"
            onClick={() => onDelete(project)}
          >
            <TrashIcon className="project-card__icon" />
          </button>
        </div>
      </div>

      {/* Body — Stage */}
      <div className="project-card__body">
        <span className="project-card__stage text-subhead">{project.stageLabel}</span>
        <span className="project-card__status text-caption1">{project.statusLabel}</span>
      </div>

      {/* Footer */}
      <div className="project-card__footer">
        <button
          className="red-glass project-card__action-btn"
          type="button"
          onClick={() => onDelete(project)}
        >
          حذف
        </button>
        <button
          className="blue-glass project-card__action-btn"
          type="button"
          onClick={() => onOpen(project)}
        >
          باز کردن
        </button>
      </div>
    </div>
  );
};