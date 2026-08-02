import React from "react";
import type { UserProject } from "../../../types/profile.types";
import "../../../styles/glass.css";
import "./projects.css";

interface ProjectDeleteConfirmModalProps {
  project: UserProject;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ProjectDeleteConfirmModal: React.FC<ProjectDeleteConfirmModalProps> = ({
  project,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="project-delete-modal__overlay" onClick={onCancel}>
      <div
        className="glass project-delete-modal__box"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-headline project-delete-modal__message">
          آیا از حذف پروژه «{project.name}» مطمئن هستید؟
        </p>
        <div className="project-delete-modal__actions">
          <button className="glass project-delete-modal__btn" type="button" onClick={onCancel}>
            لغو
          </button>
          <button className="red-glass project-delete-modal__btn" type="button" onClick={onConfirm}>
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};